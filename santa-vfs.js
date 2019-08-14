const fsp = require('./build/fsp.js');
const path = require('path');
const compileStyles = require('./build/compile-santa-sass.js');
const JSON5 = require('json5');


function vfsLoader(...plugins) {
  const findSource = async (id) => {
    if (await fsp.exists(id)) {
      return null;
    }

    const ext = path.extname(id);

    for (const plugin of plugins) {
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

    return null;
  };

  return {
    async resolveId(importee, importer) {
      if (importer) {
        // TODO: This is a super-simple relative path join. It should probably be more complex,
        // but node-resolve barfs on files that don't actually exist.
        const parent = path.dirname(importer);
        const cand = path.join(parent, importee);
        if (await findSource(cand)) {
          return cand;
        }
      }
    },

    async load(id) {
      const result = await findSource(id);
      if (!result) {
        return undefined;
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
 * Builds a virtual filesystem for Santa Tracker in the form a Rollup plugin.
 */
module.exports = (options) => {
  options = Object.assign({compile: false}, options);

  const stylesPlugin = {
    map(ext) {
      if (ext === '.css') {
        return '.scss';
      }
    },
    load(id) {
      console.info('load request for id', id);
      return compileStyles(id);
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

  return vfsLoader(stylesPlugin, jsonPlugin);
};
