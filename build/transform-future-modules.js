
const path = require('path');

/**
 * Converts the given source code into a polyfilled module version of that code.
 *
 * @param {string} id path to file
 * @param {string} code to convert
 * @return {?string} transformed code, or null for not supported
 */
module.exports = (id, code) => {
  const ext = path.extname(id);

  switch (ext) {
    case '.css':
      // This implements CSS Modules as described:
      // https://github.com/w3c/webcomponents/blob/gh-pages/proposals/css-modules-v1-explainer.md
      // https://twitter.com/argyleink/status/1157402358394920960
      return `const sheet = new CSSStyleSheet();
sheet.replaceSync(${JSON.stringify(code)});
sheet.styleSheet = sheet; // FIXME: hack to work around https://github.com/Polymer/lit-element/issues/774
export default sheet;`;

    case '.json':
      // differs from dataToEsm; spec says there's just one export
      return `export default ${code};`;

    case '.html':
  }
  // TODO(samthor): It might be fun to write a HTML Modules polyfill/rewriter, but tricky.
  // https://github.com/w3c/webcomponents/blob/gh-pages/proposals/html-modules-explainer.md
  //
  // Notes from the explainer:
  //  * The imported module has access to `document`, but its document is on `import.meta.document`
  //  * The default export is `import.meta.document`
  //  * Only `script type="module"` code is evaluated, and exports from _inline_ script tags only
  //    are merged and exposed on the top-level HTML import
  //
  // Thoughts on implementation:
  //  * We can `Object.defineProperty` the `document` on `importa.meta`, this is per-module
  //  * `script type="module"` is implicitly deferred, so we can run them all together
  //  * Option 1: set .innerHTML of a createImplementation() document- will this run script code?
  //  * Option 2: 'hoist' script to top-level, use Rollup to merge/rewrite exports
  return null;
}