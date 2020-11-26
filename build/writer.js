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
const fs = require('fs').promises;

class Writer {
  constructor(options) {
    options = Object.assign({
      loader: () => {},
      allowed: [],
      target: '',
    }, options);

    this._work = [];
    this._output = {};

    this._loader = options.loader;
    this._allowed = options.allowed.slice();
    this._target = options.target;
  }

  /**
   * Validates that the passed directory is a valid output target.
   *
   * @param {string} input to process
   * @return {string} normalized target
   */
  _validate(input) {
    const f = path.normalize(input);
    const leftPart = f.split(path.sep, 1)[0];

    if (this._allowed.length) {
      if (this._allowed.indexOf(leftPart) === -1) {
        throw new TypeError(`Disallowing write: ${f}`);
      }
    }
    if (leftPart.startsWith('.')) {
      throw new TypeError(`Disallowing dangerous write: ${f}`)
    }

    return f;
  }

  _add(name, fn) {
    name = this._validate(name);
    if (name in this._output) {
      throw new Error(`Already written: ${name}`);
    }

    const target = path.join(this._target, name);
    const dir = path.dirname(target);

    const p = fs.mkdir(dir, {recursive: true}).then(() => target)
        .then(fn)
        .then(() => undefined);  // clear result

    this._output[name] = p;
    this._work.push(p);

    return p;
  }

  /**
   * Add a single file to the release queue.
   *
   * @param {string} name
   * @param {(string|?Buffer)=} content to use, or read from disk
   * @return {!Promise<void>}
   */
  file(name, content=null) {
    return this._add(name, async (target) => {
      // nb. explicitly uses ==, to find null and undefined
      content = content == null ? await this._loader(name) : content;
      return content == null ? fs.copyFile(name, target) : fs.writeFile(target, content);
    });
  }

  /**
   * Adds many files to the release queue.
   *
   * @param {!Array<string>|!Object<string, string|!Buffer>} all
   * @return {!number}
   */
  all(all) {
    const work = [];

    if (Array.isArray(all)) {
      const safe = new Set(all);  // allow dups at the same time for copies
      safe.forEach((name) => {
        work.push(this.file(name));
      });
    } else {
      for (const name in all) {
        work.push(this.file(name, all[name]));
      }
    }
  
    return work.length;
  }

  /**
   * @return {!Promise<number>}
   */
  wait() {
    return Promise.all(this._work).then((done) => done.length);
  }
}

module.exports = {
  Writer,
};
