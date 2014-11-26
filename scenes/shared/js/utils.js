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
      clearTimeout;

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
     * @param  {jQuery}   el     The jQuery element.
     * @param  {string}   name   Class name to add.
     * @param  {Function} cb     Callback function when animation finishes.
     * @param  {Boolean}  nowait Call the callback without waiting.
     * @param  {String}   child  Child element that runs the animation or transition.
     */
    animWithClass: function(el, name, cb, nowait, child) {
      var elem = child ? el.find(child) : el;

      elem.one(ANIMATION_END + ' ' + TRANSITION_END, function(e) {
        el.removeClass(name);
        if (cb && nowait) {
          cb.apply(el[0]);
        } else if (cb) {
          setTimeout(function() { cb.apply(el[0]); }, 0);
        }
      });
      el.addClass(name);
    },

    /**
     * Runs animation on an element without using a css class.
     * @param  {String}   animation The animation name, duration and more.
     * @param  {Function} cb        The callback when animation finishes.
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
     * @param {object} module Adds onPause/onResume handlers on the module definition
     * @param {Function} isPaused Returns if the game is already paused.
     * @param {Function} pause Function to pause the game
     * @param {Function} resume Function to resume the game
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
     * @param {Function} callback The callback function.
     * @returns {Number} The request id used for canceling.
     */
    requestAnimFrame: function(callback) {
      return requestAnimFrame.call(window, callback);
    },
    /**
     * Cancel a request for animation frame.
     * @param {Number} requestId The id of the request.
     */
    cancelAnimFrame: function(requestId) {
      cancelAnimFrame.call(window, requestId);
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
   */
  utils.SmartValue.prototype.change = function(newValue) {
    var isDifferent = this.value !== newValue;
    this.value = newValue;
    return isDifferent;
  };

  /**
   * Increments or decrements the value by amount to the target, not going over it.
   * @param {target} target Final value.
   * @param {amount} amount Amount to change in this frame.
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
