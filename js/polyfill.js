/*
 * Copyright 2016 Google Inc. All rights reserved.
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

/**
 * @fileoverview Polyfills for Santa Tracker.
 */

// IE11, Edge <15
const wep = Element.prototype;
if (!('closest' in wep)) {
  if (!('matches' in wep)) {
    wep.matches = wep.msMatchesSelector || wep.webkitMatchesSelector;
  }
  wep.closest = function closest(selector) {
    let el = this;
    while (el && el.nodeType === 1) {
      if (el.matches(selector)) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };
}

// IE11
/**
 * @this {Element}
 */
function remove() {
  if (this.parentNode !== null) {
    this.parentNode.removeChild(this);
  }
}
[Element, CharacterData, DocumentType].forEach((fix) => {
  if (!('remove' in fix.prototype)) {
    fix.prototype.remove = remove;
  }
});

// IE11, Chrome <45
if (!('assign' in Object)) {
  Object.assign = function(target, var_args) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    const to = Object(target);
    for (let index = 1; index < arguments.length; ++index) {
      const source = arguments[index];
      if (source == null) {
        continue;
      }
      for (let key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          to[key] = source[key];
        }
      }
    }
    return to;
  };
}

// IE11
if (!('sign' in Math)) {
  Math.sign = function(x) {
    x = +x;
    if (x === 0 || isNaN(x)) {
      return Number(x);
    }
    return x > 0 ? +1 : -1;
  }
}
