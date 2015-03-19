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
 * Creates and centrally schedules animations.
 *
 * @constructor
 */
function Animator() {
  /**
   * Array of currently running animations.
   * @type {Array.<SimpleAnimation>}
   * @private
   */
  this.animations_ = [];

  this.updateFunction_ = this.update_.bind(this);

  this.updateScheduled_ = false;
}

/**
 * Page Visibility API property name, correcting for need of possible prefix.
 * Undefined if not supported.
 * @private {string|undefined}
 * @const
 */
Animator.pageHiddenProp_ = (function() {
  var hiddenProp = Modernizr.prefixed('hidden', document, false);
  if (hiddenProp) {
    return hiddenProp;
  }
})();

/**
 * Returns true if the current page is visible, or if the browser does not
 * support visibility events (so must assume page is visible). False if hidden.
 * Supports Firefox 10+, IE 10+, Opera 12.10+, Safari 6.1+, Chrome 13+ (desktop
 * and mobile). Supported by Android Browser only in KitKat+ and mobile Safari
 * in iOS 7+.
 * @return {boolean}
 */
Animator.isPageVisible = function() {
  // TODO(bckenny): expand to include pageshow/hide and focus/blur for older
  // browser support
  return Animator.pageHiddenProp_ ? !document[Animator.pageHiddenProp_] : true;
};

// TODO(bckenny): cancel all animations

/**
 * @param {function(number)} update Progress update callback function.
 * @param {number} duration Length of animation, in milliseconds.
 * @param {Function=} opt_easing Easing function.
 * @return {SimpleAnimation} Animation object.
 */
Animator.prototype.animate = function(update, duration, opt_easing) {
  // TODO(bckenny): add delays
  // TODO(bckenny): explicit completion callback?
  var easing = opt_easing || Animator.EASE_IN_OUT;
  var start = Animator.now_();
  var animation = new SimpleAnimation(this, update, duration, easing, start);

  // put animation in first empty slot
  // TODO(bckenny): animations should be kept strictly in order of adding?
  for (var i = 0; this.animations_[i]; i++) {}
  this.animations_[i] = animation;
  this.scheduleUpdate_();

  return animation;
};

/**
 * @private
 */
Animator.prototype.update_ = function() {
  this.updateScheduled_ = false;
  var needUpdate = false;
  var now = Animator.now_();

  for (var i = 0; i < this.animations_.length; i++) {
    if (!this.animations_[i]) {
      continue;
    }
    if (now < this.animations_[i].start_) {
      needUpdate = true;
      continue;
    }

    var animation = this.animations_[i];
    var elapsed = now - animation.start_;
    var t = Math.max(0, Math.min(elapsed / animation.duration_, 1));
    var eased = animation.easing_(t);

    animation.update_(eased);

    // if complete, remove animation from queue
    if (t === 1) {
      this.animations_[i] = null;
    } else {
      needUpdate = true;
    }
  }

  if (needUpdate) {
    this.scheduleUpdate_();
  }
};

/**
 * Schedule an animation callback.
 * @private
 */
Animator.prototype.scheduleUpdate_ = function() {
  if (this.updateScheduled_)
    return;

  this.updateScheduled_ = true;
  Animator.requestAnimationFrame_(this.updateFunction_);
};

/**
 * @private
 * @param {SimpleAnimation} animation The animation to cancel.
 */
Animator.prototype.cancelAnimation_ = function(animation) {
  for (var i = 0; i < this.animations_.length; i++) {
    if (this.animations_[i] === animation) {
      this.animations_[i] = null;
      return;
    }
  }
};

/**
 * @param {function(number)} callback
 * @private
 */
Animator.requestAnimationFrame_ = (function() {
  var raf = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame;

  if (raf) {
    return function(callback) {
      raf.call(window, callback);
    };
  } else {
    return function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  }
})();

/**
 * @private
 * @type {function(): number}
 */
Animator.now_ = (function() {
  if (window.performance && window.performance.now &&
      window.performance.now.bind) {
    return window.performance.now.bind(window.performance);
  } else if (Date.now) {
    return Date.now;
  } else {
    return function now() {
      return +(new Date());
    };
  }
})();

/**
 * Ease in and out function (with 0 second derivative at t=0, t=1).
 * @param {number} t The animation parameter.
 * @return {number} The transformed animation parameter.
 */
Animator.EASE_IN_OUT = function(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * @constructor
 * @param {Animator} animator Animation scheduler for this animation.
 * @param {function(number)} update Progress update callback function.
 * @param {number} duration Length of animation, in milliseconds.
 * @param {function(number): number} easing Easing function.
 * @param {number} start Start time for this animaton.
 */
function SimpleAnimation(animator, update, duration, easing, start) {
  this.animator_ = animator;
  this.update_ = update;
  this.duration_ = duration;
  this.easing_ = easing;
  this.start_ = start;
}

/**
 * Cancel this animation.
 */
SimpleAnimation.prototype.cancel = function() {
  this.animator_.cancelAnimation_(this);
};
