const path = require('path');
const rollup = require('rollup');
const rollupNodeResolve = require('rollup-plugin-node-resolve');
const rollupJson = require('./build/rollup-plugin-json.js');
const compileStyles = require('./build/compile-css.js');

// FIXME: This is fragile. When we require() another file in `preserveModules: true` mode, the
// `rollup-plugin-commonjs` plugin generates an import for `./_virtual/$FILENAME`. By removing this
// proxy prefix, we force Rollup to point to the real filename.
// It's also seemingly harmless with `preserveModules: false`.
const eatCJSProxy = {
  async resolveId(id, importer) {
    if (importer && id.startsWith('\0commonjs-proxy:')) {
      console.debug('handling weird import', id);
      id = id.substr('\0commonjs-proxy:'.length);
      return path.join(path.dirname(importer), id);
    }

    // console.info('resolveId', id, importer);
    // if (importer) {
    //   const resolved = await this.resolve(id, importer, {skipSelf: true});
    //   console.info('got actual resolved', resolved);
    //   resolved.external = true;
    //   return resolved;
    // }
  },
};


const rollupStyles = (compile=true) => {
  const valid = (id) => {
    const ext = path.extname(id);
    return (ext === '.scss' || ext === '.css');
  };

  return {
    async load(id) {
      if (valid(id)) {
        const {css: raw, map} = await compileStyles(id, {compile});
        const code = raw.toString('utf-8');
        return {code, map, moduleSideEffects: false};
      }
    },

    async transform(code, id) {
      if (valid(id)) {
        const update = `const sheet = new CSSStyleSheet();
sheet.replaceSync(${JSON.stringify(code)});
export default sheet;`;
        return {code: update, moduleSideEffects: false};
      }
    },
  }
};


/**
 * Is this resolved filename a valid entrypoint for browsers?
 * 
 * Currently just returns true for JS. In the far distant future, when CSS/HTML/etc modules are
 * supported by development browsers, they can be allowed too.
 *
 * @param {string} filename
 * @return {boolean}
 */
function isValidEntry(filename) {
  const ext = path.extname(filename);
  return ext === '.js';
}


/**
 * Uses Rollup to bundle stuff.
 */
module.exports = (options) => {
  return async (filename) => {
    if (!isValidEntry(filename)) {
      return null;
    }

    const start = process.hrtime();
    const bundle = await rollup.rollup({
      input: filename,
      plugins: [
        rollupNodeResolve(),  // FIXME: ugh the latest version of this doesn't let us mark things external
        rollupJson(),
        rollupStyles(),
        eatCJSProxy,
      ],
      external(id, parentId, isResolved) {
        const isLocalResolved = Boolean(id.match(/^\.{0,2}\//));
        // TODO(samthor): should only happen in dev.
        console.info('being asked if', id, parentId, isResolved, isLocalResolved);
        if (!isLocalResolved) {
//          return true;
        }
        if (isResolved && isValidEntry(id)) {
          console.warn('marking', id, 'as EXTERNAL');
          return true;
        }
      },
      // TODO(samthor): If preserveModules is true, rollup builds a module for all virtual imports.
      // (1) If we say that these might have side-effects, then we should put/rewrite them in a way
      //     that is accessible on the webserver (e.g. add ":\0.js" suffix).
      // (2) If they're only JSON or CSS etc, then they have no side-effects during dev.
      // (3) Virtuals like our Closure-ified scene code might have side effects. But they can be
      //     included from a virtual location that ends with '.js'.
//      preserveModules: true,
    });

     const out = await bundle.generate({
//      name: filename,
      format: 'es',
      sourcemap: true,
      treeshake: false,  // we want to cache the results
    });

     // Rollup builds the entire tree, but we only want the entrypoint.
    const names = out.output.map((x) => x.fileName || x.facadeModuleId);
    console.debug('got output files', names);

    const duration = process.hrtime(start);
    const ms = ((duration[0] + (duration[1] / 1e9)) * 1e3).toFixed(3);
    console.info('took', ms, 'ms');

    if (out.output.length !== 1) {
      throw new Error(`unexpected rollup length: ${out.output.length}`);
    }
    const first = out.output[0];

    return {body: first.code, map: first.map};
  };
}; 