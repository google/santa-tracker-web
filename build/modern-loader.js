/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const importUtils = require('./import-utils.js');
const path = require('path');
const rollup = require('rollup');
const transformFutureModules = require('./transform-future-modules.js');
const esmResolve = require('esm-resolve').default;


/** @type {(id: string) => string} */
const ensureModuleQuery = (id) => {
  if (!id || importUtils.isUrl(id)) {
    return id;
  }
  const prev = id.split('?')[0];
  return prev + '?module';
};


/**
 * Rewrites the given file to operate correctly as an ES6 module. This is not used in production.
 *
 * While this (currently) internally uses Rollup, it does not read file contents from disk, or have
 * any knowledge of external modules (aside resolving the correct path to node_modules/ content).
 *
 * @param {string} id
 * @param {string|{code: string, map: Object}} content
 * @param {(warn: rollup.RollupWarning) => void} onwarn
 * @return {{code: string, map: SourceMap}|null}
 */
module.exports = async (id, content, onwarn = () => {}) => {
  id = path.resolve(id);

  // If this is not a JS file, then skip Rollup and just rewrite it for the module case.
  // The "transformFutureModules" handles files like ".json", which we should be able to import.
  const ext = path.extname(id);
  if (ext !== '.js' && ext !== '.mjs') {
    if (!content) {
      throw new Error(`got no content for: ${id}`);
    }

    const transformed = await transformFutureModules(id, content.code || content);
    if (!transformed) {
      return;
    }
    content = { code: transformed.code };

    // If we transform a HTML file into a HTML module, we get back JavaScript, but there can be
    // further imports. Only bail out here if we had some other type.
    if (transformed && !transformed.needsModuleRewrite) {
      return content;
    }
  }

  /** @type {rollup.Plugin} */
  const virtualPlugin = {
    name: 'modern-loader',

    load(idToLoad) {
      idToLoad = idToLoad.split('?')[0];
      if (idToLoad !== id) {
        throw new Error(`got load request for non-main ID: ${idToLoad}`);
      }
      return content;
    },

    resolveId(importee, importer) {
      // Resolve ourselves, and anything that Rollup doesn't need to (./, ../, etc).
      if (importee === id || importUtils.alreadyResolved(importee)) {
        return ensureModuleQuery(importee);
      }

      // This isn't valid (null prefix is used to say "don't touch me").
      if (importee.startsWith('\0') || !importer) {
        return;
      }

      // Otherwise, use our custom Node resolver. This works around issues in the defacto standard
      // module 'rollup-plugin-node-resolve', such as:
      //  * lets us point to the nearest node_modules/ only (including a symlink)
      //  * resolved IDs that return as an object aren't passed to .external (below)
      const resolver = esmResolve(importer, { allowMissing: true });
      const resolved = resolver(importee);
      return ensureModuleQuery(resolved);
    },
  };

  // Rollup can be relatively slow (~10's of ms) but often this is happening in parallel. We are
  // literally only here to rewrite imports into node_modules. This can probably be done faster.
  const bundle = await rollup.rollup({
    input: id,
    plugins: [virtualPlugin],
    external(id, parentId, isResolved) {
      if (isResolved) {
        return true;
      }
    },
    // This is true for sanity as Rollup never even gets to load anything but the primary module,
    // so we should only end up with a single result (checked below).
    preserveModules: true,
    onwarn,
    treeshake: false,  // we don't want any code thrown away in dev
  });

  const out = await bundle.generate({
    name: id,
    format: 'es',
    sourcemap: true,
  });

  if (out.output.length !== 1) {
    throw new Error(`unexpected Rollup length: ${out.output.length}`);
  }
  const first = out.output[0];
  return {code: first.code, map: first.map};
};
