
const fs = require('fs');  // just for node_modules path checks
const path = require('path');
const rollup = require('rollup');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const transformFutureModules = require('./transform-future-modules.js');


const relativeUrlMatch = /^\.{0,2}\//;


/**
 * Finds the nearest "node_modules" folder, including one which is a symlink.
 *
 * @param {string} id to search from
 * @return {string}
 */
const nearestNodeModules = (id) => {
  let prev = null;
  for (let check = path.dirname(id); check != prev; check = path.dirname(check)) {
    prev = check;

    const cand = path.join(check, 'node_modules');
    let stat;
    try {
      stat = fs.statSync(cand);
    } catch (e) {
      continue;
    }

    if (stat.isDirectory()) {
      return check;
    }
  }

  throw new Error(`no node_modules found for: ${id}`);
};


// This wraps rollupNodeResolve to work around several challenges/bugs.
//  * Resolved IDs that are returned as an object type aren't passed to `config.external`, so our
//    loader cannot mark them as external.
//  * We can't restrict resolution to just dependencies inside node_modules, even though the
//    `config.basedir` option implies that we can.
//  * We want to point to a symlink node_modules/, which Node attempts to skip past.
// Revisit this in 2020+, as Rollup and the plugin might have changed by then.
const loaderRollupNodeResolve = (id) => {
  const actual = rollupNodeResolve();

  let nodeModulesPath;  // lazily-loaded below

  const rewrite = (resolved) => {
    if (!resolved) {
      return resolved;
    }

    const parts = resolved.split(path.sep);
    const nodeIndex = parts.indexOf('node_modules');
    if (nodeIndex === -1) {
      throw new Error(`got non-node_modules path from resolve: ${resolved}`);
    }
    if (!nodeModulesPath) {
      // only compute this if needed
      nodeModulesPath = nearestNodeModules(id);
    }
    return path.join(nodeModulesPath, ...parts.slice(nodeIndex));
  };

  return {
    async resolveId(importee, importer) {
      if (importer && importer !== id) {
        throw new Error(`expected only requests from source ID, was: ${importer}`);
      }
      if (relativeUrlMatch.exec(importee)) {
        // Don't resolve anything that looks sane already, although this branch should be caught by
        // the virtualPlugin below.
        return null;
      }

      let out = await actual.resolveId.call(this, importee, importer);
      if (!out) {
        return null;
      }

      // we actively retain the object here in case a package is marked in package.json as
      // `moduleSideEffects: false`. This lets Rollup (for now) skip its import if unused.
      if (typeof out === 'string') {
        out = {
          id: out,
        };
      }

      // The wrapped plugin doesn't respect our symlinks. Insist that the node_modules folder is a
      // child of basedir, and clear resolutions outside node_modules completely.
      out.id = rewrite(out.id);
      out.external = true;
      return out;
    },
  };
};


/**
 * Rewrites the given file to operate correctly as an ES6 module. This is not
 * used in production.
 *
 * While this (currently) internally uses Rollup, it does not read file contents
 * from disk, or have any knowledge of external modules (aside resolving the
 * correct path to node_modules/ content).
 *
 * @param {string} id
 * @param {string|{code: string, map: Object}} content
 */
module.exports = async (id, content) => {
  id = path.resolve(id);

  // If this is not a JS file, then skip Rollup and just rewrite it for the module case.
  const ext = path.extname(id);
  if (ext !== '.js') {
    if (!content) {
      throw new Error(`got no content for: ${id}`);
    }
    const transformed = transformFutureModules(id, content.code || content);
    if (typeof transformed === 'string') {
      return {code: transformed};
    }
    return transformed;
  }

  const virtualPlugin = {
    load(idToLoad) {
      if (idToLoad !== id) {
        throw new Error(`got load request for non-main ID: ${idToLoad}`);
      }
      return content;
    },
    resolveId(idToResolve) {
      // Resolve ourselves, and anything that Rollup doesn't need to (./, ../, etc).
      if (idToResolve === id || relativeUrlMatch.exec(idToResolve)) {
        return idToResolve;
      }
    },
  };

  // Rollup can be relatively slow (~10's of ms) but often this is happening in parallel. We are
  // literally only here to rewrite imports into node_modules. This can probably be done faster.
  const bundle = await rollup.rollup({
    input: id,
    plugins: [
      virtualPlugin,
      loaderRollupNodeResolve(id),
    ],
    external(id, parentId, isResolved) {
      if (isResolved) {
        return true;
      }
    },
    // This is true for sanity as Rollup never even gets to load anything but the primary module,
    // so we should only end up with a single result (checked below).
    preserveModules: true,
    onwarn(msg) {
      if (msg.code === 'UNUSED_EXTERNAL_IMPORT') {
        // We see this for force-imported _msg etc from `magic.js`.
        // TODO(samthor): Pass warnings back to caller to filter.
      }
      console.warn(msg.message);
    },
  });

  const out = await bundle.generate({
    name: id,
    format: 'es',
    sourcemap: true,
    treeshake: false,  // we want to cache the results
  });

  if (out.output.length !== 1) {
    throw new Error(`unexpected Rollup length: ${out.output.length}`);
  }
  const first = out.output[0];
  return {code: first.code, map: first.map};
};