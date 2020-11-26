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

const os = require('os');
const cpuCount = os.cpus().length;

class WorkGroup {
  constructor(tasks) {
    tasks = ~~tasks;
    if (tasks <= 0) {
      throw new TypeError('must have at least one task');
    }
    this._tasks = tasks;
    this._used = 0;

    this._releasePromise = null;
    this._resolveRelease = () => {};
  }

  async work(fn) {
    await this._take();
    try {
      return await fn();
    } finally {
      this._done();
    }
  }

  async _take() {
    for (;;) {
      if (this._used < this._tasks) {
        ++this._used;

        if (this._used === this._tasks) {
          this._releasePromise = new Promise((resolve) => {
            this._resolveRelease = resolve;
          });
        }

        return true;
      }

      await this._releasePromise;
    }
  }

  _done() {
    if (this._used === 0) {
      throw new TypeError(`returned too many tasks`);
    }

    const shouldResolve = (this._used === this._tasks);
    --this._used;

    shouldResolve && this._resolveRelease();
  }
}

module.exports = (tasks = cpuCount*0.75) => {
  const w = new WorkGroup(tasks)
  return (fn) => w.work(fn);
};
