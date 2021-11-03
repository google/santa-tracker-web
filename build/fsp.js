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

const fsRaw = require('fs');
const fs = fsRaw.promises;
const rimraf = require('rimraf');

module.exports = Object.assign({}, fs, {

  /**
   * @param {string} f to load stats for
   * @return {Promise<fsRaw.Stats|null>}
   */
  async statOrNull(f) {
    return fs.stat(f).catch((err) => null);
  },

  /**
   * @param {string} f to check
   * @return {Promise<boolean>} does this file exits?
   */
  async exists(f) {
    return this.statOrNull(f).then((out) => out !== null);
  },

  /**
   * @param {string} dir to create
   * @return {Promise<void>}
   */
  mkdirp(dir) {
    return fs.mkdir(dir, {recursive: true});
  },

  /**
   * @param {string} f to unlink
   * @return {Promise<void>}
   */
  unlinkAll(f) {
    if (fs.rm) {
      return fs.rm(f, { recursive: true, force: true });
    }

    // We keep rimraf around for Node < 14.14, as `fs.rm` was only added then.
    // Don't use util.promisify as we pass options to disable glob.
    return new Promise((resolve, reject) => {
      rimraf(f, {glob: false}, (err) => {
        err ? reject(err) : resolve();
      });
    });
  },

});
