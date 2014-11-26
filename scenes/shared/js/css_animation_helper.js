'use strict';

/**
 * Manages all CSS animations in a scene with class 'js-resize-animation' and
 * restarts them when window is resized.
 *
 * There is a bug animating transform: translate() with a percentage value and the
 * element animating has a width of 100% of the window. Once the animation has
 * been uploaded to the GPU it doesn't update when window is resized.
 *
 * @constructor
 * @param {HTMLElement} context The current scene wrapper.
 */

var CSSAnimationHelper = function(context) {
  this.context = context;
  this._attachToWindowResize();
  // trigger a reflow straight away
  this.restartAnimations();
};

/**
 * @type {number}
 */
CSSAnimationHelper.RESIZE_DEBOUNCE_THRESHOLD_MS = 500;

/**
 * @type {string}
 */
CSSAnimationHelper.CLASS_NAME = '.js-resize-animation';

CSSAnimationHelper.prototype = {

  /**
   * Registers a listener for the window resize events using a debounce.
   * Listener initiates a restart of animations after debounce event fires.
   */
  _attachToWindowResize: function() {
    this.onWindowResize = this._debounce(
      this.restartAnimations.bind(this),
      CSSAnimationHelper.RESIZE_DEBOUNCE_THRESHOLD_MS
    );
    $(window).on('resize', this.onWindowResize);
  },

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  _debounce: function(func, threshold, execAsap) {
    var timeout;
    return function() {
      var obj = this, args = arguments;
      function delayed() {
        if (!execAsap) {
          func.apply(obj, args);
        }
        timeout = null;
      }
      if (timeout) {
        clearTimeout(timeout);
      }
      else if (execAsap) {
        func.apply(obj, args);
      }
      timeout = setTimeout(delayed, threshold || 100);
    };
  },

  /**
   * Restarts all animations with the specified class name.
   * Called internally by the window resize handler.
   * Can be called explicitly from the outside if needed in other situations.
   */
  restartAnimations: function() {
    var $elments = $(CSSAnimationHelper.CLASS_NAME, this.context);
    $elments.each(function(i, elm) {
      // restart animation by forcing it to be removed temporarily
      $(elm).css('animation', 'none');
      // we need to trigger a reflow here otherwise the browser will batch the style updates
      var offset = elm.offsetWidth;
      $(elm).css('animation', '');
    });
  },

  /**
   * Release all resources and unbind event handlers
   */
  destroy: function() {
    $(window).off('resize', this.onWindowResize);
    this.onWindowResize = null;
    this.context = null;
  }
};

