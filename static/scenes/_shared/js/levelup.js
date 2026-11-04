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


goog.provide('app.shared.LevelUp');

goog.require('app.shared.utils');

// We are *leaking* the LevelUp global for backwards compatibility.
app.shared.LevelUp = LevelUp;

/**
 * Animation for level up.
 * @constructor
 * @param {*} _ ignored
 * @param {!Element|!jQuery} bgElem The element for the background.
 * @param {!Element|!jQuery} numberElem The element for the level number.
 */
function LevelUp(_, bgElem, numberElem) {
  this.bgElem = $(bgElem);
  this.numberElem = $(numberElem);

  /**
   * Whether the animation is driven by onFrame() rather than CSS events and
   * wall-clock timeouts. See enableManualTime().
   * @private {boolean}
   */
  this.manualTime_ = false;

  /**
   * Pending steps of the animation when running under manual time. Each step
   * fires after `remaining` seconds of game time, as advanced by onFrame().
   * @private {!Array<{remaining: number, callback: (function()|undefined)}>}
   */
  this.manualTimers_ = [];

  this.onResizeBound_ = this.onResize_.bind(this);
  $(window).on('resize', this.onResizeBound_);

  this.onResize_();
}

/**
 * Dispose of this LevelUp object, removing listeners.
 */
LevelUp.prototype.dispose = function() {
  $(window).off('resize', this.onResizeBound_);
  this.manualTimers_ = [];
};

/**
 * Switches this LevelUp to manual time, for games running under
 * `window.__MANUAL_TIME__`. Instead of waiting for CSS transition/animation
 * events (or their wall-clock fallback timeouts), each step of the animation
 * waits for a fixed amount of game time, advanced by calling onFrame() from
 * the game's advanceTime/step loop.
 */
LevelUp.prototype.enableManualTime = function() {
  this.manualTime_ = true;
};

/**
 * Advances the level up animation by delta seconds of game time. Only has an
 * effect after enableManualTime() has been called.
 * @param {number} delta seconds of game time since the last call.
 */
LevelUp.prototype.onFrame = function(delta) {
  if (!this.manualTimers_.length) {
    return;
  }
  // Callbacks may queue further steps, so only process the current ones.
  var timers = this.manualTimers_;
  this.manualTimers_ = [];
  var remaining = [];
  for (var i = 0; i < timers.length; i++) {
    var timer = timers[i];
    timer.remaining -= delta;
    if (timer.remaining <= 0) {
      timer.callback && timer.callback();
    } else {
      remaining.push(timer);
    }
  }
  this.manualTimers_ = remaining.concat(this.manualTimers_);
};

/**
 * Waits for an event on elem, or the timeout, whichever comes first. Under
 * manual time, waits for exactly `timeout` seconds of game time instead.
 * @param {!Element|!jQuery} elem
 * @param {string} event
 * @param {number} timeout in seconds
 * @param {function()=} opt_callback
 * @private
 */
LevelUp.prototype.waitFor_ = function(elem, event, timeout, opt_callback) {
  if (this.manualTime_) {
    this.manualTimers_.push({remaining: timeout, callback: opt_callback});
    return;
  }
  timeoutOneEvent(elem, event, timeout, opt_callback);
};

/**
 * Recalculate sizes for background on window resize.
 * @private
 */
LevelUp.prototype.onResize_ = function() {
  var width = window.innerWidth,
      height = window.innerHeight;

  this.bgBorderWidth = width;
  this.bgElem.css({
    width: width * 2,
    height: width * 2,
    left: width * -0.5,
    top: -(width - height / 2)
  });
};

/**
 * Called after the level number is hidden.
 * @private
 */
LevelUp.prototype.numberHidden_ = function() {
  this.numberElem.removeClass('show hide');
  this.bgElem.removeClass('is-visible');
};

/**
 * Called after the level number is shown.
 * @private
 */
LevelUp.prototype.numberShown_ = function() {
  this.waitFor_(this.numberElem, 'transitionend', 0.5, this.numberHidden_.bind(this));
  this.numberElem.addClass('hide');
  this.bgElem.css('border-width', 0);

  window.santaApp.fire('sound-trigger', 'level_transition_open');
};

/**
 * Show new level number.
 * @param {number} level The number of the new level.
 * @param {function()=} opt_callback The function to call while the level is hidden.
 */
LevelUp.prototype.show = function(level, opt_callback) {
  this.bgElem.addClass('is-visible');
  this.waitFor_(this.bgElem, 'transitionend', 1.0, opt_callback);
  this.bgElem.css('border-width', this.bgBorderWidth);

  this.waitFor_(this.numberElem, 'animationend', 1.5, this.numberShown_.bind(this));
  this.numberElem.text('' + level).addClass('show');

  window.santaApp.fire('sound-trigger', 'level_transition_close');
};

/**
 * A utility for waiting for an event with a timeout.
 * @param {!Element|!jQuery} elem
 * @param {string} event
 * @param {number} timeout in seconds
 * @param {function()=} opt_callback
 */
function timeoutOneEvent(elem, event, timeout, opt_callback) {
  elem = app.shared.utils.unwrapElement(elem);

  // Only trigger callback once.
  var finished = false;
  function finish() {
    if (!finished) {
      finished = true;
      elem.removeEventListener(event, finish);
      opt_callback && opt_callback();
    }
  }

  // Which comes first, the event or the timeout?
  elem.addEventListener(event, finish);
  window.setTimeout(finish, timeout * 1000);
}
