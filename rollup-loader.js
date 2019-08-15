const chalk = require('chalk');
const path = require('path');
const rollup = require('rollup');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const transformFutureModules = require('./build/transform-future-modules.js');
const fs = require('fs');


// This wraps rollupNodeResolve to work around several bugs.
//  * Resolved IDs that are returned as an object type aren't passed to `config.external`, so our
//    loader cannot mark them as external.
//  * We can't restrict resolution to just dependencies inside node_modules, even though the
//    `config.basedir` option implies that we can.
// Revisit this in 2020+, as Rollup might have fixed the bug then.
const externalCheckingRollupNodeResolve = (basedir) => {
  const wrapped = rollupNodeResolve({
    // FIXME: This attempts to restrict resolution to _just_ node_modules, but it doesn't seem to
    // actually work. rollupNodeResolve plays loose and fast with our passed options.
    customResolveOptions: {
      basedir: path.join(basedir, 'node_modules'),
      preserveSymlinks: true,
    },
  });

  const rewrite = (resolved) => {
    if (!resolved) {
      return resolved;
    }
    const parts = resolved.split(path.sep);
    const nodeIndex = parts.indexOf('node_modules');
    if (nodeIndex === -1) {
      // FIXME: Throw error if we can fix the resolution bug above.
      return null;
    }
    return path.join(basedir, ...parts.slice(nodeIndex));
  };

  const actual = wrapped.resolveId;
  wrapped.resolveId = async (importee, importer) => {
    let out = await actual.call(this, importee, importer);

    if (typeof out === 'string' || !out) {
      // ok
    } else if (out && out.moduleSideEffects != null) {
      // nb. This is possible and is set in `package.json`. However, it's currently impossible to
      // return the value because of the bug.
      out = out.id;
    } else {
      out = out.id;
    }

    // The wrapped plugin doesn't respect our symlinks. Insist that the node_modules folder is a
    // child of basedir, and clear resolutions outside node_modules completely.
    return rewrite(out);
  };

  return wrapped;
};


const rollupFutureModulesPlugin = {
  transform(raw, id) {
    const code = transformFutureModules(id, raw);
    if (code === null) {
      return;
    }

    // TODO(samthor): Could include original source as 'sourceMap'.

    const moduleSideEffects = ['.js', '.html'].includes(path.extname(id));
    return {
      code,
      map: {mappings: ''},  // map doesn't make sense once stringified
      moduleSideEffects,
    };
  },
};


const allowedImportRe = /^\.{0,2}\//;  // either of: / ./ ../


const allowMissingResolvePlugin = {
  async resolveId(importee, importer) {
    if (!importer || !allowedImportRe.exec(importer)) {
      if (allowedImportRe.exec(importee)) {
        // we're being asked to resolve an already resolved entrypoint. Just allow.
        return importee;
      }

      return null;
    }

    const joined = path.join(path.dirname(importer), importee);
    try {
      fs.statSync(joined);
    } catch (e) {
      // resolve only if the file _cannot_ be found
      return {id: joined, external: true};
    }

    // FIXME: resolve always anyway?
    return joined;
  },
}


/**
 * Extends the given SourceMap by adding extra filenames. This is just a way to pass used files to
 * callers of this file, even though no mappings will points towards these files.
 *
 * @param {?SourceMap} map to extend
 * @param {...string} extras extra filenames to insert
 * @return {!SourceMap}
 */
function extendSourceMap(map, ...extras) {
  if (!map) {
    map = {sources: [], sourcesContent: []};
  }

  const dedup = new Set();
  const add = (cand) => {
    const resolved = path.resolve(cand);
    dedup.add(resolved);
  };

  map.sources.forEach(add);
  extras.forEach((extra) => extra.forEach(add));

  map.sources = Array.from(dedup);
  while (map.sourcesContent.length < map.sources.length) {
    map.sourcesContent.push('');
  }

  return map;
}


/**
 * Is this resolved filename a valid module?
 *
 * Returns true for '.js', but also future potential module types, as we can serve a transpiled
 * version when correctly requested.
 *
 * @param {string} filename
 * @return {boolean}
 */
function isValidModule(filename) {
  const ext = path.extname(filename);
  return ['.js', '.css', '.json'].includes(ext);
}


function processVfsLoad(filename, out) {
  const result = {};

  if (typeof out === 'string') {
    result.body = out;
  } else {
    result.body = out.code || out.body;
    result.map = out.map || null;
  }

  if (!result.map) {
    result.map = {
      sources: [],
      sourcesContent: [''],
    };
  }


  return {
    body: out.code || out.body,
    map: out.map || null,
  };
}


/**
 * Uses Rollup to bundle entrypoint-like files.
 */
module.exports = (basedir, vfsPlugin) => {
  basedir = path.resolve(basedir);

  async function load(filename, isModuleImport) {
    if (!isModuleImport) {
      const direct = await vfsPlugin.load(filename);
      console.info('NOT module import, found direct', direct, 'for', filename);
      if (direct) {
        // FIXME: isn't adding sourceMap always
        return processVfsLoad(filename, direct);
      }

      return null;
    }

    if (!isValidModule(filename)) {
      return null;
    }

    const bundle = await rollup.rollup({
      input: filename,
      plugins: [
        vfsPlugin,
        externalCheckingRollupNodeResolve(basedir),
        rollupFutureModulesPlugin,
        allowMissingResolvePlugin,
      ],
      external(id, parentId, isResolved) {
        // TODO(samthor): should only happen in dev.
        if (isResolved && isValidModule(id)) {
          return true;
        }
      },
      // TODO(samthor): If preserveModules is true, rollup builds a module for all virtual imports.
      // (1) If we say that these might have side-effects, then we should put/rewrite them in a way
      //     that is accessible on the webserver (e.g. add ":\0.js" suffix).
      // (2) If they're only JSON or CSS etc, then they have no side-effects during dev.
      // (3) Virtuals like our Closure-ified scene code might have side effects. But they can be
      //     included from a virtual location that ends with '.js'.
      // preserveModules: true,
    });

    const out = await bundle.generate({
      name: filename,
      format: 'es',
      sourcemap: true,
      treeshake: false,  // we want to cache the results
    });

    if (out.output.length !== 1) {
      throw new Error(`unexpected rollup length: ${out.output.length}`);
    }

    const first = out.output[0];

    // Append any files included in watchFiles to the source map, even though they don't exist.
    return result = {
      body: first.code,
      map: extendSourceMap(first.map, bundle.watchFiles),
    };
  }

  return async (filename, isModuleImport=false) => {
    const start = process.hrtime();

    const out = await load(path.join(basedir, filename), isModuleImport);

    if (out) {
      const duration = process.hrtime(start);
      const ms = ((duration[0] + (duration[1] / 1e9)) * 1e3).toFixed(3);
      console.debug(chalk.blue(filename), 'took', ms, 'ms');
    }

    return out;
  };
}; 