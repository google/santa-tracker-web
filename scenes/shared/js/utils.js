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

goog.provide('app.shared.utils');

app.shared.utils = (function() {
  // Feature detection
  var ANIMATION, ANIMATION_END, TRANSITION_END, name;
  var el = document.createElement('div'),
    animationNames = {
      'WebkitAnimation': 'webkitAnimationEnd',
      'MozAnimation': 'animationend',
      'OAnimation': 'oAnimationEnd oanimationend',
      'animation': 'animationend'
    },
    transitionNames = {
      'WebkitAnimation': 'webkitTransitionEnd',
      'MozAnimation': 'transitionend',
      'OAnimation': 'oTransitionEnd otransitionend',
      'animation': 'transitionend'
    };

  for (name in animationNames) {
    if (el.style[name] !== undefined) {
      ANIMATION = name;
      ANIMATION_END = animationNames[name];
      TRANSITION_END = transitionNames[name];
    }
  }

  var utils = {
    ANIMATION_END: ANIMATION_END,
    TRANSITION_END: TRANSITION_END,

    /**
     * Assigns an animation class to the selected elements, removing it when
     * the animation finishes.
     * @param {!Element|!jQuery} el The jQuery element.
     * @param {string} name Class name to add.
     * @param {function(this:Element)} cb Callback function when animation finishes.
     * @param {boolean=} opt_nowait Call the callback without waiting.
     * @param {string=} opt_child Child element that runs the animation or transition.
     */
    animWithClass: function(el, name, cb, opt_nowait, opt_child) {
      el = $(el);
      var elem = (opt_child !== undefined) ? el.find(opt_child) : el;

      elem.one(ANIMATION_END + ' ' + TRANSITION_END, function(e) {
        el.removeClass(name);
        if (cb && opt_nowait) {
          cb.apply(el[0]);
        } else if (cb) {
          window.setTimeout(function() { cb.apply(el[0]); }, 0);
        }
      });
      el.addClass(name);
    },

    /**
     * Updates any SVG that has inline styles like "url(#blah)" to include the
     * full local path. This is required in production as our base href there
     * is actually maps.gstatic.com/...
     */
    updateLocalSVGRef: function(node) {
      var re = /^url\((["']?)#/;  // `url("#` with optional quote in group 1
      var pageUrl =
          location.href.substr(0, location.href.length - location.hash.length);
      function replacer(x) {
        return x.replace(re, 'url($1' + pageUrl + '#');
      }

      // Match url() set inside inline style.
      var styleAll = node.querySelectorAll('[style]');
      var candidates = ['clipPath', 'stroke', 'fill'];
      for (var i = 0, el; el = styleAll[i]; ++i) {
        var s = el.style;
        candidates.forEach(function(c) {
          if (s[c]) {
            s[c] = replacer(s[c]);
          }
        });
      }

      // Match url() set as an attribute, e.g. clip-path="url()".
      var attrs = ['clip-path', 'stroke', 'fill'];
      attrs.forEach(function(attr) {
        var attrAll = node.querySelectorAll('[' + attr + '^=url]');
        for (var i = 0, el; el = attrAll[i]; ++i) {
          el.setAttribute(attr, replacer(el.getAttribute(attr)));
        }
      });
    },

    /**
     * Call the callback in start of next frame.
     * @deprecated
     * @param {!Function} callback The callback function.
     * @returns {number} The request id used for canceling.
     */
    requestAnimFrame: function(callback) {
      // TODO: Remove this method and use rAF directly.
      return window.requestAnimationFrame(callback);
    },

    /**
     * Cancel a request for animation frame.
     * @deprecated
     * @param {number} requestId The id of the request.
     */
    cancelAnimFrame: function(requestId) {
      // TODO: Remove this method and use cAF directly.
      window.cancelAnimationFrame(requestId);
    },

    /**
     * Unwraps a jQuery object or confirms that an Element is non-null. Throws a
     * TypeError if there is no object available.
     * @param {Element|!jQuery} element source element or jQuery
     * @return {!Element} result element, or first jQuery object
     */
    unwrapElement: function(element) {
      var out = $(element)[0];
      if (!out) {
        throw new TypeError('Couldn\'t unwrap element, nothing matched');
      }
      return out;
    },

    /**
     * Returns the computed transform values as a raw object containing x, y
     * and rotate values (in degrees).
     * @param {!Element} elem to examine
     * @return {{x: number, y: number, rotate: number}}
     */
    computedTransform: function(elem) {
      var style = window.getComputedStyle(elem);
      var transform;

      ['', '-webkit-', '-moz-', '-ms-', '-o-'].some(function(prefix) {
        var t = style.getPropertyValue(prefix + 'transform');
        if (!t) { return false; }
        transform = t;
        return true;
      });

      if (transform === 'none') {
        return {x: 0, y: 0, rotate: 0};
      }

      var values;
      try {
        // expected to be matrix(....)
        values = transform.split('(')[1].split(')')[0].split(',');
        values = values.map(function(x) { return +x; });
      } catch(e) {
        throw new TypeError('Couldn\'t split transform, expected matrix(...)');
      }
      var a = values[0];
      var b = values[1];
      var scale = Math.sqrt(a*a + b*b);

      // arc sin, convert from radians to degrees, round
      var sin = b / scale;
      var rotate = Math.atan2(b, a) * (180 / Math.PI);

      return {x: values[4], y: values[5], rotate: rotate};
    },

    /**
     * Register listener for finish event on a Web Animation player.
     * TODO(samthor): Fix Function type when this code is replaced.
     * @param {!Animation} player The animation player object which will finish
     * @param {!Function} fn A callback function to execute when player finishes
     */
    onWebAnimationFinished: function(player, fn) {
      // TODO(samthor): player also exposes {!Promise<*>} under finished, not
      // defined in externs yet
      player.addEventListener('finish', fn, false);
    },

    /**
     * Determine whether a Web Animations player is finished. A null player
     * is considered to be finished.
     * @param {Animation} player
     * @return {boolean}
     */
    playerFinished: function(player) {
      if (!player) {
        return true;
      }
      return player.playState === 'finished';
    }
  };

  /**
   * Wraps a value and provides useful utility methods for it.
   * @param {*} opt_initialValue Any value.
   * @constructor
   * @struct
   */
  utils.SmartValue = function(opt_initialValue) {
    this.value = opt_initialValue;
  };

  /**
   * Updates the value and returns true if it is different. Useful for caching reasons to only
   * apply some side effect when the value is actually different.
   * @param {*} newValue A new value.
   * @return {boolean} whether the underlying value changed
   */
  utils.SmartValue.prototype.change = function(newValue) {
    var isDifferent = this.value !== newValue;
    this.value = newValue;
    return isDifferent;
  };

  /**
   * Increments or decrements the value by amount to the target, not going over
   * it. Assumes that the wrapped value is a number.
   * @param {number} target Final value.
   * @param {number} amount Amount to change in this frame.
   * @return {!utils.SmartValue} the this object
   */
  utils.SmartValue.prototype.moveToTarget = function(target, amount) {
    var n = /** @type {number} */ (this.value);
    n = +n;
    if (this.value !== n) {
      throw new TypeError('SmartValue does not contain a number');
    }
    if (n < target) {
      n = Math.min(target, n + amount);
    } else if (n > target) {
      n = Math.max(target, n - amount);
    }
    this.value = n;
    return this;
  };

  return utils;
})();

var utils = app.shared.utils;
