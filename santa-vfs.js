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

const fsp = require('./build/fsp.js');
const path = require('path');
const compileStyles = require('./build/compile-santa-sass.js');
const compileScene = require('./build/compile-scene.js');
const JSON5 = require('json5');


function vfsLoader(plugins) {
  plugins = plugins.filter(Boolean);  // remove null plugins

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

  return async (id) => {
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
  };
}


function buildLangPlugin(id, lang) {
  if (lang === null) {
    return null;
  }

  const messages = require(`./_messages/${lang}.json`);
  const fallback = require('./en_src_messages.json');

  // Include untranslated strings from the English source.
  for (const key in fallback) {
    if (messages[key]) {
      continue;
    }
    const untranslated = fallback[key];
    messages[key] = {
      message: untranslated['message'] || untranslated['raw'],
      missing: true,
    };
  }

  const raw = JSON.stringify(messages);

  return {
    match(idToMatch) {
      if (idToMatch === id) {
        return id;
      }
    },
    load() {
      return raw;
    },
  };
}


/**
 * Builds a virtual filesystem for Santa Tracker.
 *
 * @param {string} staticScope the URL prefix to static content
 * @param {{lang: string, compile: boolean, config: !Object<string, string>}=}
 * @return {{load: function(string): ?}}
 */
module.exports = (staticScope, options) => {
  options = Object.assign({
    lang: null,
    compile: true,
    config: {},
  }, options);

  const stylesPlugin = {
    map(ext) {
      if (ext === '.css') {
        return '.scss';
      }
    },
    load(id) {
      // FIXME: When ".css" files are loaded directly by the browser, the second two arguments are
      // actually irrelevant, since we can just use relative URLs. It saves us ~bytes.
      // nb. However, if styles are _inlined_, we're not nessecarily fixing the scope here.
      return compileStyles(id, staticScope, 'static');
    },
  };

  const configPlugin = {
    match(id) {
      if (id === 'prod/src/:config.json') {
        return id;
      }
    },
    load() {
      return JSON.stringify(options.config);
    },
  };

  const languagesPlugin = buildLangPlugin('static/:messages.json', options.lang);

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
  const closureSceneMatch = /^static\/scenes\/(\w+)\/:closure(|-\w+)\.js$/;
  const closurePlugin = {
    match(id) {
      const rooted = path.relative(__dirname, id);
      const m = closureSceneMatch.exec(rooted);
      if (m) {
        return rooted;
      }
    },
    async load(id) {
      const m = closureSceneMatch.exec(id);
      const sceneName = m[1];

      const flags = m[2];
      if (flags) {
        // nb. This previously allowed e.g., ':closure-typeSafe.js'.
        throw new Error(`unsupported Closure flags: ${flags}`);
      }

      const {code, map} = await compileScene(sceneName, options.compile);
      return {code, map};
    },
  };

  const plugins = [
    stylesPlugin,
    configPlugin,
    languagesPlugin,
    jsonPlugin,
    closurePlugin,
  ];
  return vfsLoader(plugins);
};
