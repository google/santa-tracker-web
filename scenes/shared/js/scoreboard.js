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

goog.provide('app.shared.Scoreboard');

// Load the old Constants global for backwards compatibility
goog.require('Constants');
goog.require('app.shared.SharedGameOver');

// We are *leaking* the Scoreboard global for backwards compatibility.
app.shared.Scoreboard = Scoreboard;

/**
 * Manages the scoreboard and game countdown.
 * @constructor
 * @struct
 * @param {!SharedGameOver} game The object which can be made gameover.
 * @param {*} elem Ignored scoreboard element.
 * @param {number=} opt_levels The total number of levels.
 */
function Scoreboard(game, elem, opt_levels) {
  this.game = game;

  /** @private {number} */
  this.initialCountdown_ = isFinite(Constants.INITIAL_COUNTDOWN) ? Constants.INITIAL_COUNTDOWN : 60;

  this.levels = opt_levels || 0;
  this.level = 0;
  this.score = 0;
  this.countdown = this.initialCountdown_;
  this.losing = false;
  this.lastSeconds = NaN;

  /** @private {number} */
  this.announceTimeout_ = 0;
}

/**
 * Resets the scoreboard for a new game.
 */
Scoreboard.prototype.reset = function() {
  this.restart();
  this.level = 0;
  this.score = 0;
};

/**
 * Restart the timer without resetting the level or score.
 */
Scoreboard.prototype.restart = function() {
  this.lastSeconds = NaN;
  this.countdown = this.initialCountdown_;
  this.losing = false;
};

/**
 * Updates the scoreboard each frame.
 * @param {number} delta Time since last frame.
 */
Scoreboard.prototype.onFrame = function(delta) {
  this.countdown -= delta;
  const seconds = Math.ceil(this.countdown);

  if (seconds === this.lastSeconds) {
    return;
  }
  this.lastSeconds = seconds;

  // If the delta is +ve, we are decrementing the countdown. Enact losing/etc behavior if so.
  if (delta > 0) {
    // Are we game over?
    if (this.countdown < 0) {
      this.countdown = 0;
      this.game.gameover();
    }

    // Are we losing (But not yet gameover).
    const losing = seconds <= Constants.COUNTDOWN_FLASH && seconds !== 0;
    if (this.losing !== losing) {
      this.losing = losing;
      if (seconds > 0) {
        window.santaApp.fire('sound-trigger', losing ? 'game_hurry_up' : 'game_hurry_up_end');
      }
    }
  }

  this.announce_();
};

/**
 * Adds score to the scoreboard.
 * @param {number} score The amount of score to add.
 */
Scoreboard.prototype.addScore = function(score) {
  if (score) {
    this.score += score;
    this.announce_();
  }
};

/**
 * Sets the current level on the scoreboard.
 * @param {number} level The current level, 0-based.
 */
Scoreboard.prototype.setLevel = function(level) {
  if (this.level !== level) {
    this.level = level;
    this.announce_();
  }
};

/**
 * Give the user more time.
 * @param {number} time Time to add in seconds.
 */
Scoreboard.prototype.addTime = function(time) {
  if (time) {
    this.countdown += time;
    this.announce_();
  }
};

/**
 * Announces the state to the common `santa-app`.
 */
Scoreboard.prototype.announce_ = function() {
  window.clearTimeout(this.announceTimeout_);
  this.announceTimeout_ = window.setTimeout(() => {
    const detail = {
      score: this.score,
      level: this.level + 1,  // games are zero-indexed
      levels: this.levels,
      time: this.lastSeconds || this.countdown,
    };
    window.santaApp.fire('game-score', detail);
  }, 1);
}