
const path = require('path');
const htmlModules = require('html-modules-polyfill');

/**
 * Converts the given source code into a polyfilled module version of that code.
 *
 * @param {string} id path to file
 * @param {string} code to convert
 * @return {!Promise<?string>} transformed code, or null for not supported
 */
module.exports = async (id, code) => {
  const ext = path.extname(id);

  switch (ext) {
    case '.css':
      // This implements CSS Modules as described:
      // https://github.com/w3c/webcomponents/blob/gh-pages/proposals/css-modules-v1-explainer.md
      // https://twitter.com/argyleink/status/1157402358394920960
      // It uses `CSSStyleSheetConstructor`, which is defined inside "static/src/polyfill.js", or
      // falls back to constructible sheets on Chrome and friends.
      return `const sheet = new (window.CSSStyleSheetConstructor || CSSStyleSheet)();
sheet.replaceSync(${JSON.stringify(code)});
export default sheet;`;

    case '.json':
      // differs from dataToEsm; spec says there's just one export
      return `export default ${code};`;

    case '.html':
      return htmlModules(code);
  }

  return null;
}