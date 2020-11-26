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

const glob = require('glob');

/**
 * Performs a synchronous glob over all requests, supporting Closure's negation syntax. e.g.:
 *   'foo*', '!foo-bar' => returns all `foo*` but not `foo-bar`
 *
 * If a non-magic glob (i.e., no * or glob charaters) doesn't match a file, then this method
 * throws Error.
 *
 * @param {...string} req
 * @return {!Array<string>}
 */
module.exports = (...req) => {
  const out = new Set();
  const options = {mark: true};

  for (let cand of req) {
    const negate = cand[0] === '!';
    if (negate) {
      cand = cand.substr(1);
    }

    const result = glob.sync(cand, options);
    if (!result.length && !glob.hasMagic(cand)) {
      throw new Error(`couldn't match file: ${cand}`);
    }

    for (const each of result) {
      negate ? out.delete(each) : out.add(each);
    }
  }

  // filter out directories
  return [...out].filter((cand) => !cand.endsWith('/'));
};
