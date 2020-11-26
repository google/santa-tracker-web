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

/**
 * @fileoverview Polyfill for the 2nd arg to `ClassList.toggle`.
 *
 * Run in support mode. Use only ES5.
 */

var testEl = document.createElement('div');
testEl.classList.toggle('testClass', false);
if (testEl.classList.contains('testClass')) {
  var original = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function(name, force) {
    if (force === undefined) {
      return original.call(this, name);
    } else if (force) {
      this.add(name);
    } else {
      this.remove(name);
    }
    return this.contains(name);
  };
}
