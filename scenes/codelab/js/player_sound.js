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
    return new Animation(document.body, app.PlayerSound.walk_, {duration: 100});
  },

  stop: function() {
    return new Animation(document.body, app.PlayerSound.stop_, {duration: 100});
  },

  lost: function() {
    return new Animation(document.body, app.PlayerSound.lost_, {duration: 100});
  },

  disable: function() {
    app.PlayerSound.disabled_ = true;
  },

  walk_: function(huh) {
    if (app.PlayerSound.disabled_ || app.PlayerSound.isWalking_) {
      return;
    }
    app.PlayerSound.isWalking_ = true;
    Klang.triggerEvent('computer_walk_start');
  },

  stop_: function(huh) {
    if (app.PlayerSound.disabled_ || !app.PlayerSound.isWalking_) {
      return;
    }
    app.PlayerSound.isWalking_ = false;
    Klang.triggerEvent('computer_walk_stop');
  },

  lost_: function(huh) {
    if (app.PlayerSound.disabled_ || app.PlayerSound.isLost_) {
      return;
    }
    app.PlayerSound.isLost_ = true;
    app.PlayerSound.stop_();
    Klang.triggerEvent('computer_huh');
  }
};
