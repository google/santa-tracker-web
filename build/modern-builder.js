const resolveNode = require('./resolve-node.js');
const rollup = require('rollup');
const terser = require('terser');
const transformFutureModules = require('./transform-future-modules.js');
const path = require('path');
const importUtils = require('./import-utils.js');



module.exports = async (entrypoints, options) => {
  options = Object.assign({
    loader: () => {},
    external: () => {},
    workDir: null,
    metaUrlScope: null,
  }, options);

  const resolveNodePlugin = {resolveId: resolveNode};

  const virtualPlugin = {
    async load(idToLoad) {
      if (idToLoad.startsWith('/')) {
        idToLoad = path.relative(process.cwd(), idToLoad);
      }

      if (options.workDir && !idToLoad.startsWith(options.workDir + path.sep)) {
        throw new Error(`refusing to load module outside workDir: ${idToLoad}`);
      }

      const entrypoint = entrypoints[idToLoad];
      if (entrypoint) {
        return entrypoint;
      }

      return options.loader(idToLoad);
    },
    transform(content, id) {
      if (!id.endsWith('.js')) {
        return transformFutureModules(id, content.code || content);
      }
    },
    resolveId(importee, importer) {
      let id = undefined;

      if (importer === undefined) {
        id = importee;
      } else if (importee.match(/^\.{1,2}\//)) {
        id = path.join(path.dirname(importer), importee);
      }

      // support marking depepdencies as external with a possible rewrite
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
      const u = new URL(rel, options.metaUrlScope);

      // TODO(samthor): escape
      return `'${u.toString()}'`;
    },
  };

  const input = {};
  Object.keys(entrypoints).forEach((id) => {
    input[id] = id;
  });

  const bundle = await rollup.rollup({
    input,
    plugins: [resolveNodePlugin, virtualPlugin],
  });

  const generated = await bundle.generate({
    format: 'esm',
    chunkFileNames: path.join(options.workDir || '', '_[hash].js'),
  });

  // console.info('got bundle of modules', Object.keys(generated.output).length);
  // console.debug(generated.output);

  return generated.output;
};
