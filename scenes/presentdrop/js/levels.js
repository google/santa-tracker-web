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

goog.provide('app.Levels');

/**
 * Keeps track of current level, the level animation and transitions between
 * them.
 * @constructor
 * @param {!app.Game} game The game object.
 */
app.Levels = function(game) {
  this.game = game;

  this.bgElem = this.game.elem.find('.level-bg');
  this.fgElem = this.game.elem.find('.level-fg');
  this.lastFgElem = this.fgElem.children().eq(0);
  this.nextFgElem = this.fgElem.children().eq(1);
};

/**
 * Resets the levels animation for a new game.
 */
app.Levels.prototype.reset = function() {
  this.fgElem.css('right', '0px').children().attr('class', 'level-fg0');
  this.bgElem.css('right', '0px');
  this.bgRight = this.bgRightTarget = 0;
  this.fgRight = 0;
  this.fgLoopCounter = 0;
};

/**
 * Runs every frame and updates the level animation.
 * @param {number} delta Seconds since last onFrame.
 */
app.Levels.prototype.onFrame = function(delta) {
  /**
   * This is the nastiest function in the game. This was moved here from
   * CSS3 Animations to make sure FG images always fit when switching levels.
   * Also to make pause and restart 100% reliable.
   */

  var nextLevel = false,
      newFgRight = this.fgRight + app.Levels.FG_TRANSITION_SPEED * delta;

  // If a fg animation loop finished, check if the level is finished.
  if (newFgRight > app.Constants.LEVEL_FG_WIDTH) {
    this.lastFgElem.attr('class', this.nextFgElem.attr('class'));
    this.fgLoopCounter = (this.fgLoopCounter + 1) %
        app.Levels.FG_ITERATIONS_PER_LEVEL;

    nextLevel = this.fgLoopCounter === 0;
    if (nextLevel) {
      this.nextFgElem.attr('class', 'level-fg' + this.game.level %
          app.Constants.LEVEL_COUNT);
      this.bgRightTarget = this.bgRight + app.Constants.LEVEL_BG_WIDTH;
    }
  }

  // Update foreground
  this.fgRight = newFgRight % app.Constants.LEVEL_FG_WIDTH;
  this.fgElem.css('right', -this.fgRight + 'px');

  // When switching levels, update the background.
  if (this.bgRight !== this.bgRightTarget) {
    this.bgRight += app.Levels.BG_TRANSITION_SPEED * delta;
    if (this.bgRight > this.bgRightTarget) {
      this.bgRight = this.bgRightTarget = (this.game.level - 1) %
          app.Constants.LEVEL_COUNT ? this.bgRightTarget : 0;
    }
    this.bgElem.css('right', -this.bgRight + 'px');
  }

  // Notify game that level is finished.
  if (nextLevel) {
    this.game.nextLevel();
  }
};

/** @const */
app.Levels.FG_ITERATIONS_PER_LEVEL = Math.round(app.Constants.LEVEL_DURATION /
    app.Constants.LEVEL_FG_TRANSITION);
/** @const */
app.Levels.FG_TRANSITION_SPEED = app.Constants.LEVEL_FG_WIDTH /
    app.Constants.LEVEL_FG_TRANSITION;
/** @const */
app.Levels.BG_TRANSITION_SPEED = app.Constants.LEVEL_BG_WIDTH /
    app.Constants.LEVEL_BG_TRANSITION;
