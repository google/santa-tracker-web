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
 * AnimationUtilTimeline is a manager of many Animation instances. It is useful
 * for scheduling and scrubbing a collection of animations and related
 * callbacks.
 *
 * The timeline emulates the Animation interface, but is not intended to
 * completely implement it. It supports the playbackRate and currentTime
 * properties.
 *
 * This object expects the Web Animations API to be available either natively
 * or via polyfill (https://github.com/web-animations/web-animations-js).
 *
 * @constructor
 */
var AnimationUtilTimeline = function() {
  if (!('animate' in Element.prototype)) {
    throw new Error('AnimationUtilTimeline expects Web Animations support');
  }

  var timing = {duration: 1000, iterations: Infinity};
  this.hintAtCall_ = this.hintAtCall_.bind(this);

  /**
   * @type {!Element}
   * @private
   */
  this.node_ = document.createElement('div');

  /**
   * @type {!Animation}
   * @private
   */
  this.anim_ = this.node_.animate([], timing);

  /**
   * @type {!Array<{offset: number, anim: !Animation}>}
   * @private
   */
  this.players_ = [];

  /**
   * @type {!Array<{when: number, fn: !Function}>}
   * @private
   */
  this.calls_ = [];

  /**
   * Changing the playbackRate of an Animation can cause its currentTime to
   * become invalid, as its underlying state must be resolved outside a normal
   * browser tick. In this case, store the currentTime from before the change,
   * so that a non-null value is always available.
   * @type {number}
   * @private
   */
  this.localTime_ = 0;
};

AnimationUtilTimeline.prototype = {

  /**
   * Hints to this AnimationUtilTimeline that it should run any pending calls,
   * which will occur synchronously on this thread.
   * @private
   */
  hintAtCall_: function() {
    var now = this.currentTime;
    var i;

    for (i = 0; i < this.calls_.length; ++i) {
      var call = this.calls_[i];
      if (call.when > now) {
        break;
      }
      call.fn();
    }

    this.calls_ = this.calls_.slice(i);
  },

  /**
   * @param {number} playbackRate to set
   */
  set playbackRate(playbackRate) {
    this.localTime_ = this.anim_.currentTime;
    this.anim_.playbackRate = playbackRate;
    this.players_.forEach(function(p) { p.anim.playbackRate = playbackRate; });
  },

 /**
  * @return {number}
  */
  get playbackRate() {
    return this.anim_.playbackRate;
  },

  /**
   * @param {number} currentTime to set
   */
  set currentTime(currentTime) {
    var seekForward = currentTime > this.currentTime;

    this.anim_.currentTime = currentTime;
    this.players_.forEach(function(p) {
      p.anim.currentTime = p.offset + currentTime;
    });

    if (seekForward) {
      // For now, this does not trigger calls in the past.
      this.hintAtCall_();
    }
  },

  /**
   * @return {number}
   */
  get currentTime() {
    var time = this.anim_.currentTime;
    if (time === null) {
      console.debug('currentTime was null, returning fake localTime_');
      return this.localTime_;
    }
    return time;
  },

  /**
   * Schedule an animation on this AnimationUtilTimeline.
   *
   * @param {number} when to start the animation, may be in the past
   * @param {!Element} el to animate
   * @param {!Array<*>} steps of the animation
   * @param {number|!Object} timing to run for
   * @return {!Animation}
   */
  schedule: function(when, el, steps, timing) {
    var now = this.currentTime;
    var player = el.animate(steps, timing);

    player.playbackRate = this.anim_.playbackRate;
    player.currentTime = now - when;

    this.players_.push({anim: player, offset: now - when});
    return player;
  },

  /**
   * Request that a function be called at an absolute time, including in the
   * past. However, the function will only be called when playbackRate is +ve.
   * The call will be removed from this timeline once it has been invoked.
   *
   * @param {number} when to call
   * @param {function(): void} fn to invoke
   */
  call: function(when, fn) {
    var now = this.currentTime;

    // Insert into the calls list, maintaining sort order.
    var low = 0;
    var high = this.calls_.length - 1;
    
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      var call = this.calls_[mid];
      if (call.when > when) {
        high = mid;
      } else {
        low = mid+1;
      }
    }
    this.calls_.splice(low, 0, {when: when, fn: fn});

    var player = this.schedule(when, this.node_, [], 0);
    player.addEventListener('finish', this.hintAtCall_);
  },

  /**
   * Removes and cancels a previously registered animation via its Animation.
   *
   * @param {Animation} player to remove
   */
  remove: function(player) {
    if (!('cancel' in player)) {
      throw new Error('AnimationUtilTimeline remove expects Animation, was: ' + opt_player);
    }

    var i;
    for (i = 0; i < this.players_.length; ++i) {
      var cand = this.players_[i];
      if (cand.anim == player) {
        player.cancel();
        break;
      }
    }
    this.players_.splice(i, 1);
  },

  /**
   * Removes and cancels all players and calls from this timeline.
   */
  removeAll: function() {
    this.players_.forEach(function(p) { p.anim.cancel(); });
    this.players_ = [];
    this.calls_ = [];
  }

};

window["AnimationUtilTimeline"] = AnimationUtilTimeline;
