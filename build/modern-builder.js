const resolveNode = require('./resolve-node.js');
const rollup = require('rollup');
const terser = require('terser');
const transformFutureModules = require('./transform-future-modules.js');
const path = require('path');



module.exports = async (entrypoints, options) => {
  options = Object.assign({
    loader: () => {},
    external: () => {},
  }, options);

  const resolveNodePlugin = {resolveId: resolveNode};

  const virtualPlugin = {
    async load(idToLoad) {
      if (idToLoad.startsWith('/')) {
        idToLoad = path.relative(process.cwd(), idToLoad);
      }

      // TODO(samthor): we could just pass Object<string, string> here
      const entrypoint = entrypoints.get(idToLoad);
      if (entrypoint) {
        return entrypoint.code;
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
      // FIXME: do something sensible.
      // nb. this is inlined as source.
      return `'__import_meta_'`;
    },
  };

  const input = {};
  entrypoints.forEach((_, id) => {
    input[id] = id;
  });

  const bundle = await rollup.rollup({
    input,
    plugins: [resolveNodePlugin, virtualPlugin],
  });

  const generated = await bundle.generate({
    format: 'esm',
    chunkFileNames: 'c[hash].js',
  });

  // console.info('got bundle of modules', Object.keys(generated.output).length);
  // console.debug(generated.output);

  return generated.output;
};
