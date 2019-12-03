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
      o = fallback[msgid];
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