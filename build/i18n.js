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

const fs = require('fs');
const path = require('path');
const Entities = require('html-entities').AllHtmlEntities;
 
const entities = new Entities();
const emptyFunc = () => {};
const fallback = require('../en_src_messages.json');

/**
 * @param {string} lang
 * @param {function(string): ?string} callback
 * @return {function(?string): string}
 */
function lookup(lang, callback=emptyFunc) {
  const data = require(`../_messages/${lang}.json`);

  // Support e.g. "fr" for "fr-CA", or "es" for "es-419".
  let similarLangData = null;
  const similarLang = lang.split('-')[0];
  if (similarLang !== lang) {
    try {
      similarLangData = require(`../_messages/${similarLang}.json`)
    } catch (e) {
      similarLangData = null;
    }
  }

  return (msgid) => {
    if (msgid === null) {
      return lang;
    }

    let o = data[msgid];
    if (!o) {
      const out = callback(msgid);
      if (typeof out === 'string') {
        return out;
      } else if (out !== undefined) {
        return '?';
      }
      o = (similarLangData ? similarLangData[msgid] : null) || fallback[msgid] || null;
    }

    if (o && o['raw']) {
      // This is a fallback message, so tease out the actual string. Each <ph...> contains real
      // text and an optional <ex></ex>.
      const r = o['raw'];
      return r.replace(/<ph.*?>(.*?)<\/ph>/g, (match, part) => {
        // remove <ex></ex> if we find it
        part = part.replace(/<ex>.*?<\/ex>/g, '');
        if (!part) {
          throw new Error(`got invalid part for raw string: ${r}`);
        }

        return entities.decode(part);
      });
    }

    return o && (o['message'] || o['raw']) || '?';
  };
}

let langCache;

lookup.all = function(callback=emptyFunc) {
  if (langCache === undefined) {
    const cands = fs.readdirSync(path.join(__dirname, '..', '_messages'));
    langCache = cands.map((file) => file.split('.')[0]);
  }

  const out = {};
  langCache.forEach((lang) => {
    out[lang] = lookup(lang, (msgid) => callback(lang, msgid));
  });
  return out;
};

module.exports = lookup;