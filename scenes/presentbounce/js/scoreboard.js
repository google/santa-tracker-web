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

goog.provide('app.Scoreboard');

/**
 * Manages the scoreboard and game timer.
 * A minimalistic fork of the shared class. We count up instead of down. No gameover.
 * @constructor
 * @param {!app.Game} game The object which can be paused or restarted
 * @param {!Element} elem The scoreboard element.
 * @param {!totalLevels} totalLevels The total number of levels.
 */
app.Scoreboard = function(game, elem, totalLevels) {
  this.game = game;
  this.elem = $(elem);
  this.totalLevels = totalLevels;

  this.scoreElem = this.elem.find('.score .value');
  this.levelElem = this.elem.find('.current-level');
  this.minutesElem = this.elem.find('.time .minutes');
  this.secondsElem = this.elem.find('.time .seconds');
  this.levelItemElems = this.elem.find('.level .level-item');

  this.attachEvents();

  // Initial state
  this.reset();
}

/**
 * Resets the scoreboard for a new game (first level).
 */
app.Scoreboard.prototype.reset = function() {
  this.score = 0;
  this.resetTimer();
  this.setLevel(0);
  this.unpause();
  this.addScore(0);
};

app.Scoreboard.prototype.unpause = function() {
  this.elem.find('.pause').removeClass('paused');
  this.onFrame(0);
}

/**
 * Resets the countdown to start again.
 */
app.Scoreboard.prototype.resetTimer = function() {
  this.countdown = -1;
  this.lastSeconds = null;
}

/**
 * Restart the timer
 */
app.Scoreboard.prototype.restart = function() {
  this.countdown = -1;
  this.lastSeconds = null;
  this.onFrame(0);
};

/**
 * Attaches events for scoreboard interactions.
 */
app.Scoreboard.prototype.attachEvents = function() {
  var self = this;  // intentionally held, so that 'this' is the element
  this.elem.find('.pause').on('click', function(event) {
    self.game.onInteraction();
    $(event.target).blur();

    $(this).toggleClass('paused');
    self.game.togglePause();

    // TODO(bckenny): should this be firing global_pause? or handled elsewhere?
    if ($(this).hasClass('paused')) {
      window.santaApp.fire('sound-ambient', 'global_pause');
    } else {
      window.santaApp.fire('sound-ambient', 'global_unpause');
    }
  });
  this.elem.find('.restart').on('click', function(event) {
    $(event.target).blur();
    self.game.onInteraction();
    self.game.restartLevel();
  });
};

/**
 * Updates the scoreboard each frame.
 * @param {number} delta Time since last frame.
 */
app.Scoreboard.prototype.onFrame = function(delta) {

  this.countdown += delta;

  // Cache track text changes.
  var seconds = Math.max(0, Math.ceil(this.countdown));
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
};

/**
 * Returns the current countdown
 * @return {number} Countdown
 */
app.Scoreboard.prototype.getCountdown = function() {
  return this.countdown;
};

/**
 * Adds score to the scoreboard.
 * @param {number} score The amount of score to add.
 */
app.Scoreboard.prototype.addScore = function(score) {
  this.score += score;

  if (this.scoreElem.length > 0) {
    this.scoreElem.text(this.score);
  }
};

/**
 * Sets the current level on the scoreboard.
 * @param {number} level The current level, 0-based.
 */
app.Scoreboard.prototype.setLevel = function(level) {
  if (this.levelElem.length > 0 && level >= 0) {
    this.levelElem.text(level + 1);
  }

  if (this.levelItemElems.length > 0 && level < this.totalLevels) {
    this.levelItemElems.removeClass('is-active').eq(level).addClass('is-active');
  }
};

/**
 * A helper that zero-pads a number to 2 digits. F.ex. 5 becomes "05".
 * @param {number} num The number to pad.
 * @return {string} Zero padded number.
 * @private
 */
app.Scoreboard.pad_ = function(num) {
  return (num < 10 ? '0' : '') + num;
};
