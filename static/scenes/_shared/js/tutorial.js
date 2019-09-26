/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */


goog.provide('app.shared.Tutorial');


/**
 * @param {!Array<string>|string} arg
 * @return {!Array<string>}
 */
function splitAll(arg) {
  if (typeof arg === 'string') {
    arg = arg.split(/\s+/g);
  }
  return arg.filter(Boolean);
}


app.shared.Tutorial = class Tutorial {

  /**
   * @param {!Array<string>|string} tutorials All tutorials.
   */
  constructor(tutorials) {
    this._tutorials = splitAll(tutorials);
    this._dismissed = new Set();
  }

  /**
   * Start tutorials.
   */
  start() {
    window.santaApp.fire('tutorial-queue', this._tutorials);
  }

  /**
   * Turn off a tutorial because user has already used the controls.
   *
   * @param {!Array<string>|string} all Tutorials to dismiss
   * @param {...string} rest Rest of tutorials to dismiss
   */
  off(all, ...rest) {
    all = splitAll(all).concat(rest).filter((cand) => {
      if (this._dismissed.has(cand)) {
        return false;
      }
      this._dismissed.add(cand);
      return true;
    });
    if (all.length) {
      window.santaApp.fire('tutorial-dismiss', all);
    }
  }

  /**
   */
  dispose() {}
};
