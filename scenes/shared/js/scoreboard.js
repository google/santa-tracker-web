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
 * @param {!SharedGameOver} game The object which can be made gameover.
 * @param {Element|!jQuery} elem The scoreboard element.
 * @param {number=} opt_levels The total number of levels.
 */
function Scoreboard(game, elem, opt_levels) {
  this.game = game;
  this.elem = $(elem);
  this.scoreElem = this.elem.find('.score .value');
  this.levelElem = this.elem.find('.current-level');
  this.minutesElem = this.elem.find('.time .minutes');
  this.secondsElem = this.elem.find('.time .seconds');
  this.remainingElem = this.elem.find('.time .remaining');
  this.statusElem = this.elem.find('.time .status');
  this.levelItemElems = this.elem.find('.level .level-item');

  if (opt_levels !== undefined) {
    this.elem.find('.total-levels').text('/' + opt_levels);
  }

  // Initial state
  this.reset();
}

/**
 * Resets the scoreboard for a new game.
 */
Scoreboard.prototype.reset = function() {
  this.score = 0;
  this.countdown = Constants.INITIAL_COUNTDOWN;
  this.lastSeconds = null;
  this.losing = false;

  this.setLevel(0);

  if (this.remainingElem.length > 0) {
    this.remainingElem.removeClass('losing');
  }

  this.elem.find('.pause').removeClass('paused');
  this.onFrame(0);
  this.addScore(0);
};


/**
 * Restart the timer
 */
Scoreboard.prototype.restart = function() {
  this.countdown = Constants.INITIAL_COUNTDOWN;
  this.lastSeconds = null;
  this.losing = false;

  if (this.remainingElem.length > 0) {
    this.remainingElem.removeClass('losing');
  }

  this.onFrame(0);
};


/**
 * Updates the scoreboard each frame.
 * @param {number} delta Time since last frame.
 */
Scoreboard.prototype.onFrame = function(delta) {
  // Are we game over?
  this.countdown -= delta;
  if (this.countdown < 0) {
    this.countdown = 0;
    this.game.gameover();
  }

  // Update track position
  var trackX = 1 - (this.countdown / Constants.COUNTDOWN_TRACK_LENGTH);
  trackX = (trackX < 0 ? 0 : trackX) * -this.remainingElem.width();

  if (this.remainingElem.length > 0) {
    this.remainingElem.css('transform', 'translate3d(' + trackX + 'px, 0, 0)');
    this.statusElem.css('transform', 'translate3d(' + trackX + 'px, 0, 0)');
  }

  // Cache track text changes.
  var seconds = Math.ceil(this.countdown);
  if (seconds === this.lastSeconds) {
    return;
  }
  this.lastSeconds = seconds;

  if (this.minutesElem.length > 0) {
    this.minutesElem[0].textContent = Scoreboard.pad_(Math.floor(seconds / 60));
  }

  if (this.secondsElem.length > 0) {
    this.secondsElem[0].textContent = Scoreboard.pad_(seconds % 60);
  }

  // Are we losing (But not yet gameover).
  var losing = seconds <= Constants.COUNTDOWN_FLASH && seconds !== 0;
  if (this.losing !== losing) {
    this.losing = losing;
    if (this.remainingElem.length > 0) {
      this.remainingElem.toggleClass('losing', losing);
    }
    if (seconds > 0) {
      window.santaApp.fire('sound-trigger',
          losing ? 'game_hurry_up' : 'game_hurry_up_end');
    }
  }
};

/**
 * Adds score to the scoreboard.
 * @param {number} score The amount of score to add.
 */
Scoreboard.prototype.addScore = function(score) {
  this.score += score;

  if (this.scoreElem.length > 0) {
    this.scoreElem.text(this.score);
  }
};

/**
 * Sets the current level on the scoreboard.
 * @param {number} level The current level, 0-based.
 */
Scoreboard.prototype.setLevel = function(level) {
  if (this.levelElem.length > 0 && level >= -1) {
    this.levelElem.text('' + (level + 1));
  }

  if (this.levelItemElems.length > 0 && level >= -1) {
    this.levelItemElems.removeClass('is-active');
    if (level >= 0) {
      this.levelItemElems.eq(level).addClass('is-active');
    }
  }
};

/**
 * Bumps the time ball drop.
 * @param {number} time Time to add in seconds.
 */
Scoreboard.prototype.addTime = function(time) {
  this.countdown += time;
};

/**
 * A helper that zero-pads a number to 2 digits. F.ex. 5 becomes "05".
 * @param {number} num The number to pad.
 * @return {string} Zero padded number.
 * @private
 */
Scoreboard.pad_ = function(num) {
  return (num < 10 ? '0' : '') + num;
};
