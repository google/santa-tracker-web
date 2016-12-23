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

if (!('closest' in window.Element.prototype)) {
  // IE11

  if (!('matches' in window.Element.prototype)) {
    window.Element.prototype.matches = window.Element.prototype.msMatchesSelector || window.Element.prototype.webkitMatchesSelector;
  }

  window.Element.prototype.closest = function closest(selector) {
    let el = this;

    while (el && el.nodeType === 1) {
      if (el.matches(selector)) {
        return el;
      }
      el = el.parentNode;
    }

    return null;
  };
}

if (!('assign' in Object)) {
  Object.assign = function(target, var_args) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    var to = Object(target);
    for (var index = 1; index < arguments.length; ++index) {
      var source = arguments[index];
      if (source == null) {
        continue;
      }
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          to[key] = source[key];
        }
      }
    }
    return to;
  };
}

if (!('sign' in Math)) {
  Math.sign = function(x) {
    x = +x;
    if (x === 0 || isNaN(x)) {
      return Number(x);
    }
    return x > 0 ? +1 : -1;
  }
}
