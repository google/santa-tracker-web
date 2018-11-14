const path = require('path');
const rollup = require('rollup');
const rollupNodeResolve = require('rollup-plugin-node-resolve');

/**
 * @param {function(string, string|undefined): string|undefined}
 * @return {{name: string, resolveId: function, load: function}}
 */
function virtualPlugin(virtual) {
  const cache = {};

  return {
    name: 'virtual',
    resolveId(id, importer) {
      const out = virtual(id, importer);
      if (out !== undefined) {
        cache[id] = out;
        return id;
      }
    },
    load(id) {
      return cache[id];
    },
  }
}

const rollupInputOptions = (filename, virtual) => {
  const plugins = [
    rollupNodeResolve(),
  ];
  if (virtual) {
    plugins.unshift(virtualPlugin(virtual));
  }

  return {
    input: filename,
    plugins,
    onwarn(warning, onwarn) {
      if (warning.code === 'EVAL') {
        // Closure uses eval() through its generated code, so ignore this for now.
      } else {
        return onwarn(warning);
      }
    },
  };
};

const rollupOutputOptions = (filename) => ({
  name: filename,
  format: 'es',
});

module.exports = async (filename, virtual=null) => {
  const bundle = await rollup.rollup(rollupInputOptions(filename, virtual));
  const {code} = await bundle.generate(rollupOutputOptions(filename));
  return code;
};
