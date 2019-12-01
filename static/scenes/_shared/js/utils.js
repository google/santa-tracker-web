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

  /**
   * Wraps a value and provides useful utility methods for it.
   */
  class SmartValue {

    /**
     * @param {*} value Any value.
     */
    constructor(value) {
      this.value = value;
    }

    /**
     * Updates the value and returns true if it is different. Useful for caching reasons to only
     * apply some side effect when the value is actually different.
     * @param {*} newValue A new value.
     * @return {boolean} whether the underlying value changed
     */
    change(newValue) {
      const isDifferent = (this.value !== newValue);
      this.value = newValue;
      return isDifferent;
    }

    /**
     * Increments or decrements the value by amount to the target, not going over
     * it. Assumes that the wrapped value is a number.
     * @param {number} target Final value.
     * @param {number} amount Amount to change in this frame.
     * @return {!SmartValue} the this object
     */
    moveToTarget(target, amount) {
      let n = /** @type {number} */ (+this.value);
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
    }
  }

  return {

    /**
     * Assigns an animation class to the selected elements, removing it when
     * the animation finishes.
     * @param {!Element|!jQuery|!Array<!Element>} all Elements to apply to
     * @param {string} name Class name to add.
     * @param {?function(): void=} cb Callback function when any animation finishes.
     */
    animWithClass: function(all, name, cb) {
      if (!all.length) {
        all = [all];
      }
      /** @suppress {checkTypes} */
      all = Array.prototype.slice.call(all);

      all.forEach((el) => {
        el.classList.add(name);

        const handler = () => {
          el.classList.remove(name);

          el.removeEventListener('animationend', handler);
          el.removeEventListener('transitionend', handler);

          if (cb) {
            cb();
            cb = null;
          }
        };

        el.addEventListener('animationend', handler);
        el.addEventListener('transitionend', handler);
      });
    },

    /**
     * Unwraps a jQuery object or confirms that an Element is non-null. Throws a
     * TypeError if there is no object available.
     * @param {?Element|!jQuery|!Array<!Element>} element source element or jQuery
     * @return {?Element} result element, or first jQuery object
     */
    unwrapElement: function(element) {
      if (element instanceof Node) {
        return element;
      }
      return element[0] || null;
    },

    /**
     * Returns the computed transform values as a raw object containing x, y
     * and rotate values (in degrees).
     * @param {!Element} elem to examine
     * @return {{x: number, y: number, rotate: number}}
     */
    computedTransform: function(elem) {
      const style = window.getComputedStyle(elem);
      let transform;

      ['', '-webkit-', '-moz-', '-ms-', '-o-'].some((prefix) => {
        const t = style.getPropertyValue(prefix + 'transform');
        if (!t) {
          return false;
        }
        transform = t;
        return true;
      });

      if (transform === 'none') {
        return {x: 0, y: 0, rotate: 0};
      }

      let values;
      try {
        // expected to be matrix(....)
        values = transform.split('(')[1].split(')')[0].split(',').map((x) => +x);
      } catch (e) {
        throw new TypeError('Couldn\'t split transform, expected matrix(...)');
      }
      const a = values[0];
      const b = values[1];

      // arc sin, convert from radians to degrees, round
      const rotate = Math.atan2(b, a) * (180 / Math.PI);
      return {x: values[4], y: values[5], rotate};
    },

    /**
     * Register listener for finish event on a Web Animation player.
     *
     * @param {!Animation} player The animation player object which will finish
     * @param {!Function} fn A callback function to execute when player finishes
     */
    onWebAnimationFinished: function(player, fn) {
      // Animation optionally exposes 'finished' as a Promise for when the animation is done,
      // although it's not in the externs yet.
      const finishedPromise = /** @type {?Promise<void>} */ (player['finished']);
      if (finishedPromise && finishedPromise.then) {
        finishedPromise.then(fn);
      } else {
        player.addEventListener('finish', fn, false);
      }
    },

    /**
     * Determine whether a Web Animations player is finished. A null player
     * is considered to be finished.
     * @param {?Animation} player
     * @return {boolean}
     */
    playerFinished: function(player) {
      return !player || player.playState === 'finished';
    },

    /**
     * Guesses whether the device is touchEnabled: more specifically, whether the primary device
     * is a touch device.
     */
    get touchEnabled() {
      if ('standalone' in navigator) {
        return true;  // iOS devices
      }
      const hasCoarse = window.matchMedia('(pointer: coarse)').matches;
      if (hasCoarse) {
        return true;  // true-ish
      }
      const hasPointer = window.matchMedia('(pointer: fine)').matches;
      if (hasPointer) {
        return false;  // prioritize mouse control
      }

      // Otherwise, fall-back to older style mechanisms.
      return ('ontouchstart' in window) ||
          window.DocumentTouch && document instanceof window.DocumentTouch;
    },

    SmartValue,
  };
})();
