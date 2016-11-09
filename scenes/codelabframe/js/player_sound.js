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

goog.provide('app.PlayerSound');

/**
 * State machine for player sounds.
 */
app.PlayerSound = {
  isWalking_: false,
  isLost_: false,
  disabled_: false,

  reset: function() {
    app.PlayerSound.isLost_ = false;
    app.PlayerSound.disabled_ = false;
    app.PlayerSound.stop_();
  },

  walk: function() {
    var e = new KeyframeEffect(null, [], 100);
    e.onsample = app.PlayerSound.walk_;
    return e;
  },

  stop: function() {
    var e = new KeyframeEffect(null, [], 100);
    e.onsample = app.PlayerSound.stop_;
    return e;
  },

  lost: function() {
    var e = new KeyframeEffect(null, [], 100);
    e.onsample = app.PlayerSound.lost_;
    return e;
  },

  disable: function() {
    app.PlayerSound.disabled_ = true;
  },

  /**
   * @param {number} timeFraction
   * @param {!KeyframeEffect} effect
   * @param {!Animation} animation
   */
  walk_: function(timeFraction, effect, animation) {
    if (app.PlayerSound.disabled_ || app.PlayerSound.isWalking_) {
      return;
    }
    app.PlayerSound.isWalking_ = true;
    window.santaApp.fire('sound-trigger', 'computer_walk_start');
  },

  /**
   * @param {number} timeFraction
   * @param {!KeyframeEffect} effect
   * @param {!Animation} animation
   */
  stop_: function(timeFraction, effect, animation) {
    if (app.PlayerSound.disabled_ || !app.PlayerSound.isWalking_) {
      return;
    }
    app.PlayerSound.isWalking_ = false;
    window.santaApp.fire('sound-trigger', 'computer_walk_stop');
  },

  /**
   * @param {number} timeFraction
   * @param {!KeyframeEffect} effect
   * @param {!Animation} animation
   */
  lost_: function(timeFraction, effect, animation) {
    if (app.PlayerSound.disabled_ || app.PlayerSound.isLost_) {
      return;
    }
    app.PlayerSound.isLost_ = true;
    app.PlayerSound.stop_();
    window.santaApp.fire('sound-trigger', 'computer_huh');
  }
};
