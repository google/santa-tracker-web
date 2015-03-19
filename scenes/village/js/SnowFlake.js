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

/**
 * Represents a snowflake DOM element and associated animation information.
 * @param {!jQuery} element
 * @param {number} animationLength
 * @constructor
 */
function SnowFlake(element, animationLength) {
  /**
   * @private {!Element}
   */
  this.element_ = element[0];

  /**
   * The start to reset time, to synchronize with the CSS animation.
   * @private {number}
   */
  this.animationLength_ = animationLength;

  // Add an animation phase shift so not in sync with other snowflakes.
  var animationDelay = Math.round(-animationLength * Math.random()) + 'ms';
  element.find('.snow-flake-inner')
      .css(SnowFlake.ANIMATION_DELAY_, animationDelay);
}

/**
 * The animation-delay CSS property name, possibly with vendor prefix.
 * @private {string}
 */
SnowFlake.ANIMATION_DELAY_ = Modernizr.cssanimations ?
    /** @type {string}  */ (Modernizr.prefixed('animationDelay')) :
    'animationDelay';

/**
 * The transition-duration CSS property name, possibly with vendor prefix.
 * @private {string}
 */
SnowFlake.TRANSITION_DURATION_ = Modernizr.csstransitions ?
    /** @type {string}  */ (Modernizr.prefixed('transitionDuration')) :
    'transitionDuration';

/**
 * Start animation horizontally centered on newLeft. Calls back reclaimCallback
 * with this object when animation is complete.
 * @param {number} newLeft
 * @param {!function(SnowFlake)} reclaimCallback
 */
SnowFlake.prototype.startAnimation = function(newLeft, reclaimCallback) {
  var flake = this.element_;
  var that = this;

  // Set initial style in a rAF because Firefox is being weird about event loop
  // timing and dropping this transient style if called in the same event loop
  // cycle with the reclaim logic below (which then ruins the transition).
  window.requestAnimationFrame(function() {
    flake.style[VillageUtils.CSS_TRANSFORM] = 'translateX(' + newLeft +
        'px) translateY(-20px)';
    flake.style[SnowFlake.TRANSITION_DURATION_] = '0s';
    flake.style.opacity = '.99';

    // Wait a frame so layout is set and can be transitioned.
    window.requestAnimationFrame(function() {
      flake.style[VillageUtils.CSS_TRANSFORM] = 'translateX(' + newLeft +
         'px) translateY(' + windowHeight() + 'px)';
      flake.style[SnowFlake.TRANSITION_DURATION_] = '';
      flake.style.opacity = '.25';

      // After animation, reset position and notify snowflake controller.
      window.setTimeout(function() {
        flake.style[VillageUtils.CSS_TRANSFORM] = '';
        flake.style[SnowFlake.TRANSITION_DURATION_] = '0s';
        flake.style.opacity = '';
        reclaimCallback(that);
      }, that.animationLength_);
    });
  });
};
