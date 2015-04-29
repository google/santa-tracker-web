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
 * @constructor
 */
var FauxTimeline = function() {
  var timing = {duration: 1000, iterations: Infinity};
  this.hintAtCall_ = this.hintAtCall_.bind(this);

  /**
   * @type {!AnimationPlayer}
   * @private
   */
  this.anim_ = document.body.animate([], timing);

  /**
   * @type {number}
   * @private
   */
  this.localTime_ = 0;

  /**
   * @type {!Array.<!AnimationPlayer>}
   * @private
   */
  this.players_ = [];

  /**
   * @type {!Array.<{{when: number, fn: function}}>}
   * @private
   */
  this.calls_ = [];
};

FauxTimeline.prototype = {

  /**
   * Hints to this FauxTimeline that it should run any pending calls.
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

  set playbackRate(v) {
    if (v < 0) {
      throw new Error('FauxTimeline doesn\'t support <0 playbackRate');
    }
    this.localTime_ = this.anim_.currentTime;
    this.anim_.playbackRate = v;
    this.players_.forEach(function(p) { p.playbackRate = v; });
  },

  get playbackRate() {
    return this.anim_.playbackRate;
  },

  get currentTime() {
    var time = this.anim_.currentTime;
    if (time === null) {
      console.debug('currentTime was null, returning fake localTime_');
      return this.localTime_;
    }
    return time;
  },

  /**
   * Seek to the specified time. Synchronously runs any registered calls.
   *
   * @param {number} to seek to, may not be in past
   */
  seek: function(to) {
    var delta = to - this.currentTime;
    if (delta < 0) {
      throw new Error('FauxTimeline doesn\'t support -ve seeks');
    }
    this.anim_.currentTime += delta;
    this.players_.forEach(function(p) { p.currentTime += delta; });
    this.hintAtCall_();
  },

  /**
   * Schedule an animation on this FauxTimeline.
   *
   * @param {number} when to start the animation, may be in the past
   * @param {!Element} el to animate
   * @param {!Array.<!Object>} steps of the animation
   * @param {number} duration to run for
   * @return {AnimationPlayer}
   */
  schedule: function(when, el, steps, duration) {
    var now = this.currentTime;
    var player = el.animate(steps, duration);

    player.playbackRate = this.anim_.playbackRate;
    player.currentTime = now - when;
    this.players_.push(player);
    return player;
  },

  /**
   * Call a function in the future.
   *
   * @param {number} when to call, must be past currentTime
   * @param {function} fn to invoke
   */
  call: function(when, fn) {
    var now = this.currentTime;
    if (when < now) {
      throw new Error('FauxTimeline doesn\'t support calls in past: ' + (now - when));
    }

    // Insert into the calls list, maintaining sort order.
    // TODO: binary search would be faster.
    var i;
    for (i = 0; i < this.calls_.length; ++i) {
      var call = this.calls_[i];
      if (call.when > when) {
        break;
      }
    }
    this.calls_.splice(i, 0, {when: when, fn: fn});

    var player = this.schedule(when, document.body, [], 0);
    player.addEventListener('finish', this.hintAtCall_);
    return player;
  },

  /**
   * Removes a previously registered animation via its AnimationPlayer.
   *
   * @param {!AnimationPlayer=} opt_player to remove, undefined for all
   */
  remove: function(opt_player) {
    if (opt_player === undefined) {
      this.players_.forEach(function(player) {
        player.cancel();
      });
      this.players_ = [];
      this.calls_ = [];
      return;
    }

    if (!('cancel' in opt_player)) {
      throw new Error('FauxTimeline remove expects AnimationPlayer, was: ' + opt_player);
    }
    opt_player.cancel();

    var index = this.players_.indexOf(opt_player);
    if (index > -1) {
      this.players_.splice(index, 1);
    }
  }

};
