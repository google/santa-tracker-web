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

const alreadyResolvedMatch = /^(\.{0,2}\/|[a-z]\w*\:)/;  // matches start of './' or 'https:' etc

if (path.sep !== '/') {
  throw new Error(`importUtils is unsupported on Windows (path.sep=${path.sep})`);
}

module.exports = {

  /**
   * Returns whether the given string is a URL or URL-like.
   *
   * @param {string|?URL} cand
   * @return {boolean}
   */
  isUrl(cand) {
    if (cand instanceof URL || cand.startsWith('//')) {
      return true;
    } else if (!cand) {
      return false;
    }

    try {
      new URL(cand);  // doesn't allow "//-prefix"
      return true;
    } catch (e) {
      // ignore
    }
    return false;
  },

  /**
   * Returns the pathname of this URL, or the string itself (if not a URL).
   *
   * @param {string|!URL} cand to check
   * @param {string} root optional root if not a URL
   * @return {string}
   */
  pathname(cand, root='/') {
    if (this.isUrl(cand)) {
      return new URL(cand).pathname;
    } else if (path.isAbsolute(cand)) {
      return cand;  // looks like "/foo"
    } else {
      return path.join(root, cand);
    }
  },

  /**
   * Join a URL path or other components.
   *
   * @param {string|!URL} cand
   * @param {string} rest
   * @return {string}
   */
  join(cand, rest) {
    if (this.isUrl(cand)) {
      const u = new URL(rest, cand);  // order is addition, then base
      return u.toString();
    }
    return path.join(cand, rest);
  },

  /**
   * Joins a URL path or other components, but ensures a trailing slash.
   *
   * @param {string|!URL} cand
   * @param {string} rest
   * @return {string}
   */
  joinDir(cand, rest) {
    const out = rest ? this.join(cand, rest) : cand;
    if (!out.endsWith('/')) {
      return `${out}/`;
    }
    return out;
  },

  /**
   * Is the passed candidate string already fully resolved?
   *
   * @param {string|?URL} cand
   * @return {boolean}
   */
  alreadyResolved(cand) {
    if (cand instanceof URL) {
      return true;
    } else if (!cand) {
      return false;
    }
    // TODO(samthor): can ES modules import "//domain.com/blah.js"?
    return Boolean(alreadyResolvedMatch.exec(cand));
  },

  /**
   * Ensure that the specified ID is suitable for import as an ES6 module path.
   *
   * @param {string|!URL} cand
   * @return {string}
   */
  relativize(cand) {
    if (this.alreadyResolved(cand)) {
      return cand.toString();
    }
    return `./${cand}`;
  },

  /**
   * Builds an ES6 module which simply imports the given targets for their side-effects.
   *
   * @param {...string} resources 
   * @return {string}
   */
  staticImport(...resources) {
    return resources.map((resource) => {
      // TODO(samthor): escape resource.
      return `import '${this.relativize(resource)}';\n`;
    }).join('');
  },

};