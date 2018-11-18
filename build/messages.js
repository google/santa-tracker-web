const emptyFunc = () => {};

/**
 * @param {string} lang
 * @param {function(string): ?string} callback
 * @return {function(string): string}
 */
module.exports = function(lang, callback=emptyFunc) {
  const data = require(`../_messages/${lang}.json`);

  return (msgid) => {
    const o = data[msgid];
    if (!o) {
      const out = callback(msgid);
      return typeof out === 'string' ? out : '?';
    }
    return o['message'];
  };
};
