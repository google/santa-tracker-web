const fsp = require('./build/fsp.js');
const path = require('path');
const compileStyles = require('./build/compile-santa-sass.js');
const compileScene = require('./build/compile-scene.js');
const JSON5 = require('json5');


function vfsLoader(plugins) {
  const findSource = async (id) => {
    if (await fsp.exists(id)) {
      return null;
    }

    const ext = path.extname(id);

    for (const plugin of plugins) {

      // check mapping from extension to 'provider' which must exist
      if (plugin.map) {
        let cands = await plugin.map(ext) || [];
        if (typeof cands === 'string') {
          cands = [cands];
        }

        for (const cand of cands) {
          const resolved = id.substr(0, id.length - ext.length) + cand;
          if (await fsp.exists(resolved)) {
            return {plugin, resolved};
          }
        }
      }

      // match filenames
      if (plugin.match) {
        const matched = await plugin.match(id);
        if (matched) {
          const resolved = typeof matched === 'string' ? matched : id;
          return {plugin, resolved};
        }
      }

    }

    return null;
  };

  return {
    async load(id) {
      const result = await findSource(id);
      if (!result) {
        return null;
      }

      const {plugin, resolved} = result;
      const out = await plugin.load(resolved);

      if (out && out.map && this.addWatchFile) {
        const sources = out.map.sources || [];
        for (const source of sources) {
          console.info('adding virtual watch', source);
          this.addWatchFile(source);
        }
      }

      return out;
    },
  };
}

/**
 * Builds a virtual filesystem for Santa Tracker in the form a Rollup-like plugin.
 *
 * @param {string} staticScope the URL prefix to static content
 * @param {boolean=} compile whether to compile Closure code
 * @return {{load: function(string): ?}}
 */
module.exports = (staticScope, compile=true) => {
  const stylesPlugin = {
    map(ext) {
      if (ext === '.css') {
        return '.scss';
      }
    },
    load(id) {
      // FIXME: When ".css" files are loaded directly by the browser, the second two arguments are
      // actually irrelevant, since we can just use relative URLs. It saves us ~bytes.
      return compileStyles(id, staticScope, 'static');
    },
  };

  const jsonPlugin = {
    map(ext) {
      if (ext === '.json') {
        return '.json5';
      }
    },
    async load(id) {
      const raw = await fsp.readFile(id);
      return JSON.stringify(JSON5.parse(raw));
    }
  };

  // TODO(samthor): Closure doesn't have to be tied to scenes. But, it's mostly for historic code,
  // so maybe it's not worth making it generic.
  const closureSceneMatch = /^static\/scenes\/(\w+)\/:closure\.js$/;
  const closurePlugin = {
    match(id) {
      const rooted = path.relative(__dirname, id);
      const m = closureSceneMatch.exec(rooted);
      if (m) {
        return m[1];
      }
    },
    async load(sceneName) {
      const {js, map} = await compileScene({sceneName, typeSafe: true}, compile);
      return {code: js, map};
    },
  };

  return vfsLoader([stylesPlugin, jsonPlugin, closurePlugin]);
};
