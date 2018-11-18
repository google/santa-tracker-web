const emptyFunc = () => {};
const fallback = require('../en_src_messages.json');

/**
 * @param {string} lang
 * @param {function(string): ?string} callback
 * @return {function(string): string}
 */
module.exports = function(lang, callback=emptyFunc) {
  const data = require(`../_messages/${lang}.json`);

  return (msgid) => {
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
    return o['message'] || o['raw'] || '?';
  };
};
