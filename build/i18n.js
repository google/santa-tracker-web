const fs = require('fs');
const path = require('path');

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