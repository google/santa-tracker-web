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


const path = require('path');
const htmlModules = require('html-modules-polyfill');

/**
 * Converts the given source code into a polyfilled module version of that code.
 *
 * @param {string} id path to file
 * @param {string} code to convert
 * @return {Promise<null | { code: string, needsModuleRewrite: boolean }>} transformed code, or null for not supported
 */
module.exports = async (id, code) => {
  const ext = path.extname(id);

  switch (ext) {
    case '.css': {
      // This implements CSS Modules as described:
      // https://github.com/w3c/webcomponents/blob/gh-pages/proposals/css-modules-v1-explainer.md
      // https://twitter.com/argyleink/status/1157402358394920960
      // It uses `CSSStyleSheetConstructor`, which is defined inside "static/src/polyfill.js", or
      // falls back to constructible sheets on Chrome and friends.
      const out = `const sheet = new (window.CSSStyleSheetConstructor || CSSStyleSheet)();
sheet.replaceSync(${JSON.stringify(code)});
export default sheet;`;
      return { code: out, needsModuleRewrite: false };
    }

    case '.json': {
      // differs from dataToEsm; spec says there's just one export
      return { code: `export default ${code};`, needsModuleRewrite: false };
    }

    case '.html': {
      const out = await htmlModules(code);
      return { code: out, needsModuleRewrite: true };
    }
  }

  return null;
}