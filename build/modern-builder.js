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

const rollup = require('rollup');
const transformFutureModules = require('./transform-future-modules.js');
const rollupPluginCJS = require('@rollup/plugin-commonjs');
const {default: rollupPluginNode} = require('@rollup/plugin-node-resolve');
const path = require('path');
const importUtils = require('./import-utils.js');
const fs = require('fs');


/**
 * @param {{[id: string]: string|undefined}} entrypoints undefined to use loader, string to use this code
 */
module.exports = async (entrypoints, options) => {
  options = Object.assign({
    loader: () => {},
    external: () => {},
    metaUrlScope: null,
    commonJS: false,
    workDir: null,
    format: 'esm',
  }, options);

  /** @type {{[id: stirng]: string}} */
  let loadCache = {};

  const virtualPlugin = {
    async load(idToLoad) {
      if (idToLoad.startsWith('\0')) {
        return;
      }

      if (idToLoad.startsWith('/')) {
        idToLoad = path.relative(process.cwd(), idToLoad);
      }

      // If we were provided code for this entrypoint, return it first.
      const entrypoint = entrypoints[idToLoad];
      if (entrypoint) {
        return entrypoint;
      }

      // We just resolved this, so use the cache.
      if (idToLoad in loadCache) {
        return loadCache[idToLoad];
      }

      return options.loader(idToLoad);
    },
    transform(content, id) {
      if (!id.endsWith('.js')) {
        return transformFutureModules(id, content.code || content);
      }
    },
    async resolveId(importee, importer) {
      let id = undefined;

      if (importer === undefined) {
        id = importee;
      } else if (importee.match(/^\.{1,2}\//)) {
        id = path.join(path.dirname(importer), importee);

        // This looks like something that's relative or resolved, but it might not be, perhaps
        // because it's a commonJS import that has no suffix.
        // See if our loader understands it, if so, cache and return.
        if (!fs.existsSync(id)) {
          const checkLoad = await options.loader(id);
          if (!checkLoad) {
            return;
          }
          loadCache[id] = checkLoad;
        }
      }

      // support marking depedencies as external with a possible rewrite
      if (id) {
        const ret = options.external(id);
        if (ret) {
          if (typeof ret === 'string') {
            id = ret;
          }
          return {id, external: true};
        }
      }

      return id;
    },
    resolveImportMeta(prop, {moduleId}) {
      if (prop !== 'url') {
        throw new TypeError(`got unsupported import.meta.${prop} request for: ${moduleId}`);
      } else if (!options.metaUrlScope) {
        throw new TypeError(`import.meta.url request without metaUrlScope: ${moduleId}`);
      }

      const rel = path.relative(options.workDir, moduleId);
      const output = importUtils.join(options.metaUrlScope, rel);

      // TODO(samthor): escape
      return `'${output}'`;
    },
  };

  const input = {};
  Object.keys(entrypoints).forEach((id) => {
    input[id] = id;
  });

  const resolveNodePlugin = rollupPluginNode({ browser: true });
  const plugins = [virtualPlugin, resolveNodePlugin];
  if (options.commonJS) {
    plugins.unshift(rollupPluginCJS({ extensions: [ '.js', '.mjs' ]}));
  }

  const bundle = await rollup.rollup({input, plugins});

  const generated = await bundle.generate({
    format: options.format,
    entryFileNames: '[name]',  // we expect .js to be provided
    chunkFileNames: path.join(options.workDir || '', '_[hash].js'),
  });

  // console.info('got bundle of modules', Object.keys(generated.output).length);
  // console.debug(generated.output);

  return generated.output;
};
