goog.provide('app.shared.utils');

var utils = app.shared.utils = (function() {
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
    },
    requestAnimFrame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(/* function */ callback, /* DOMElement */ element) {
        return window.setTimeout(callback, 1000 / 60);
      },
    cancelAnimFrame = window.cancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.oCancelRequestAnimationFrame ||
      window.msCancelRequestAnimationFrame ||
      window.clearTimeout;

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
     * @param {!jQuery} el The jQuery element.
     * @param {string} name Class name to add.
     * @param {function} cb Callback function when animation finishes.
     * @param {boolean} nowait Call the callback without waiting.
     * @param {string} child Child element that runs the animation or transition.
     */
    animWithClass: function(el, name, cb, nowait, child) {
      var elem = child ? el.find(child) : el;

      elem.one(ANIMATION_END + ' ' + TRANSITION_END, function(e) {
        el.removeClass(name);
        if (cb && nowait) {
          cb.apply(el[0]);
        } else if (cb) {
          window.setTimeout(function() { cb.apply(el[0]); }, 0);
        }
      });
      el.addClass(name);
    },

    /**
     * Runs animation on an element without using a css class.
     * @param {!jQuery} el The jQuery element.
     * @param {string} animation The animation name, duration and more.
     * @param {function} cb The callback when animation finishes.
     */
    anim: function(el, animation, cb) {
      var elem = el[0];
      el.one(ANIMATION_END + ' ' + TRANSITION_END, function(e) {
        if (cb) {
          cb.apply(elem);
        }
      });
      elem.style[ANIMATION] = animation;
    },

    /**
     * A state machine for the global pause feature. To make sure the scene isn't
     * resumed when it was already paused.
     * @param {!Object} module Adds onPause/onResume handlers on the module definition
     * @param {function} isPaused Returns if the game is already paused.
     * @param {function} pause Function to pause the game
     * @param {function} resume Function to resume the game
     */
    globalPause: function(module, isPaused, pause, resume) {
      var wasPaused = false;
      module.onPause = function() {
        wasPaused = isPaused();
        if (!wasPaused) {
          pause();
        }
      };
      module.onResume = function() {
        if (!wasPaused) {
          resume();
        }
      };
    },

    /**
     * Call the callback in start of next frame.
     * @param {function} callback The callback function.
     * @returns {number} The request id used for canceling.
     */
    requestAnimFrame: function(callback) {
      return requestAnimFrame.call(window, callback);
    },

    /**
     * Cancel a request for animation frame.
     * @param {number} requestId The id of the request.
     */
    cancelAnimFrame: function(requestId) {
      cancelAnimFrame.call(window, requestId);
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

      ['-webkit-', '-moz-', '-ms-', '-o-', ''].some(function(prefix) {
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
        return {};
      }
      var out = {x: values[4], y: values[5], rotate: null};

      var a = values[0];
      var b = values[1];
      var scale = Math.sqrt(a*a + b*b);

      // arc sin, convert from radians to degrees, round
      var sin = b / scale;
      out.rotate = Math.atan2(b, a) * (180 / Math.PI);

      return out;
    },

    /**
     * Register listener for finish event on a Web Animation player.
     * @param {!AnimationPlayer} player The animation player object which will finish
     * @param {function} fn A callback function to execute when player finishes
     */
    onWebAnimationFinished: function(player, fn) {
      // don't run if .finished is a boolean; this was dropped after legacy
      if (player.finished && player.finished !== true) {
        player.finished.then(fn);
      } else {
        player.addEventListener('finish', fn, false);
      }
    },

    /**
     * Determine whether a Web Animations player is finished. A null player
     * is considered to be finished.
     * @param {AnimationPlayer} player
     * @return {boolean}
     */
    playerFinished: function(player) {
      if (!player) {
        return true;
      }
      return player.playState === 'finished' || player.finished === true;
    }
  };

  /**
   * Wraps a value and provides useful utility methods for it.
   * @param {*} initialValue Any value.
   * @constructor
   */
  utils.SmartValue = function(initialValue) {
    this.value = initialValue;
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
   */
  utils.SmartValue.prototype.moveToTarget = function(target, amount) {
    if (this.value < target) {
      this.value = Math.min(target, this.value + amount);
    } else if (this.value > target) {
      this.value = Math.max(target, this.value - amount);
    }
    return this;
  };

  return utils;
})();
