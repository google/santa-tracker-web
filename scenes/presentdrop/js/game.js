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

goog.provide('app.Game');

goog.require('app.Constants');
goog.require('app.shared.utils');
goog.require('app.shared.pools');
goog.require('app.shared.Gameover');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.SharedGame');
goog.require('app.shared.Tutorial');
goog.require('app.Chimney');
goog.require('app.Controls');
goog.require('app.Levels');
goog.require('app.Player');
goog.require('app.Present');

/**
 * Main game class.
 * @param {!Element} elem A DOM element which wraps the game.
 * @implements {SharedGame}
 * @constructor
 * @struct
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);

  this.player = new app.Player(this, this.elem.find('.player'));
  this.scoreboard = new Scoreboard(this, this.elem.find('.board'), app.Constants.TOTAL_LEVELS);
  this.gameoverDialog = new Gameover(this, this.elem.find('.gameover'));
  this.tutorial = new Tutorial(this.elem, 'touch-leftright', 'keys-space keys-leftright', 'spacenav-space spacenav-leftright');
  this.controls = new app.Controls(this);
  this.levels = new app.Levels(this);
  this.entities = [];
  this.isPlaying = false;
  this.paused = false;
  this.hidden = false;
  this.scale = 1;
  this.chimneysElem = this.elem.find('.chimneys');
  this.presentsElem = this.elem.find('.presents');
  this.gameStartTime = Date.now();
  this.chimneySpeed = 0;
  this.lastFrame = 0;
  this.level = 0;
  this.nextChimney = 0;
  this.requestId = 0;

  // Cache a bound onFrame since we need it each frame.
  this.onFrame_ = this.onFrame_.bind(this);

  this.watchSceneSize_();
  this.preloadPools_();
};

/**
 * Create some chimneys and presents at startup so we don't suffer performance penalty
 * during gameplay on android browsers.
 * @private
 */
app.Game.prototype.preloadPools_ = function() {
  // We shouldn't need more than 7 chimneys during gameplay.
  for (var i = 0; i < 7; i++) {
    app.Chimney.pool(this);
  }

  // There won't ever exist more than 2 presents at same time, thanks to gravity.
  app.Present.pool(this);
  app.Present.pool(this);
};

/**
 * Starts the game.
 * @export
 */
app.Game.prototype.start = function() {
  this.restart();
  this.tutorial.start();
};

/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  // Cleanup last game
  this.entities.forEach(function(e) { e.remove(); });
  this.entities = [];

  // Reset game state
  var match = location.search.match(/[?&]level=(\d+)/) || [];
  this.level = (+match[1] || 1) - 1;
  this.scoreboard.reset();
  this.scoreboard.setLevel(this.level);

  this.chimneySpeed = app.Constants.CHIMNEY_START_SPEED;
  this.nextChimney = 0;

  this.player.reset();
  this.levels.reset();
  this.paused = false;

  // Start game
  window.santaApp.fire('sound-ambient', 'music_start_ingame');
  window.santaApp.fire('sound-trigger', 'pd_start_game');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'presentdrop'});
  this.unfreezeGame();
};

/**
 * Called each frame while game is running. Calls onFrame on all entities.
 */
app.Game.prototype.onFrame_ = function() {
  if (!this.isPlaying) {
    return;
  }

  // Calculate delta.
  var now = Date.now() / 1000;
  var delta = now - this.lastFrame;
  this.lastFrame = now;

  // Update static entities
  this.player.onFrame(delta);
  this.levels.onFrame(delta);
  this.scoreboard.onFrame(delta);
  this.updateChimneys_(delta);

  // Update entities and track which are dead.
  var deadEntities = [];
  for (var i = 0, entity; entity = this.entities[i]; i++) {
    entity.onFrame(delta);

    if (entity.dead) {
      deadEntities.push(i);
    }
  }

  // Clean up dead entities
  deadEntities.forEach(function(index, i) {
    this.entities.splice(index - i, 1);
  }, this);

  // Request next frame
  this.requestId = window.requestAnimationFrame(this.onFrame_);
};

/**
 * Scale the game down for smaller resolutions.
 * @param {number} scale A scale between 0 and 1 on how much to scale.
 */
app.Game.prototype.setScale = function(scale) {
  this.scale = scale;
  var view = this.elem.find('.view');
  var bg = this.elem.find('.bg');
  if (scale < 1) {
    view.css('transform', 'scale(' + scale + ')');
    bg.css('transform', 'scaleY(' + scale + ')');
  } else {
    view.removeAttr('style');
  }
};

/**
 * Called each frame. Creates new chimneys on a set interval.
 * @param {number} delta Seconds since last update.
 * @private
 */
app.Game.prototype.updateChimneys_ = function(delta) {
  this.nextChimney -= delta;
  if (this.nextChimney > 0) {
    return;
  }

  // Create chimney
  var chimney = app.Chimney.pop(this);
  this.entities.push(chimney);

  // Schedule next chimney.
  var multiply = Math.pow(app.Constants.CHIMNEY_SPAWN_MULTIPLY_EACH_LEVEL,
      this.level);
  var interval = app.Constants.CHIMNEY_SPAWN_BASE +
      app.Constants.CHIMNEY_SPAWN_INTERVAL * multiply;
  var variance = app.Constants.CHIMNEY_SPAWN_VARIANCE * multiply;
  this.nextChimney = (interval - variance / 2) + Math.random() * variance;
};

/**
 * Called by player to create a present at the specified x position.
 * @param {number} x
 */
app.Game.prototype.createPresent = function(x) {
  var present = app.Present.pop(this, x);
  this.entities.push(present);
};

/**
 * Called by a chimney when it is hit to record its score.
 * @param {number} score The score gained.
 */
app.Game.prototype.hitChimney = function(score) {
  this.scoreboard.addScore(score);
  this.scoreboard.addTime(1);
  window.santaApp.fire('sound-trigger', 'pd_player_present_pickup');
};

/**
 * Iterates all chimneys that have not been hit. Used for collision detection.
 * @param {!function(this:app.Present, !app.Chimney)} fn The function to run for each chimney.
 * @param {!app.Present} thisArg to use
 */
app.Game.prototype.forEachActiveChimney = function(fn, thisArg) {
  for (var i = 0, chimney; chimney = this.entities[i]; i++) {
    if (chimney instanceof app.Chimney) {
      fn.call(thisArg, chimney);
    }
  }
};

/**
 * Stops the onFrame loop and stops all relevant CSS3 animations.
 * Used by pause and gameover.
 */
app.Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.elem.addClass('frozen');
};

/**
 * Starts the onFrame loop and enables CSS3 animations.
 * Used by unpause and restart.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.elem.removeClass('frozen').focus();

    this.isPlaying = true;
    this.lastFrame = Date.now() / 1000;
    this.requestId = window.requestAnimationFrame(this.onFrame_);
  }
};

/**
 * Called by levels to bump the level.
 */
app.Game.prototype.nextLevel = function() {
  if (this.level === app.Constants.TOTAL_LEVELS - 1) {
    this.gameover();
    return;
  }

  this.level++;
  this.scoreboard.setLevel(this.level);
  this.chimneySpeed += app.Constants.CHIMNEY_SPEED_PER_LEVEL;
  window.santaApp.fire('sound-trigger', 'pd_player_level_up');
};

/**
 * Called by the scoreboard to stop the game when the time is up.
 */
app.Game.prototype.gameover = function() {
  this.freezeGame();
  this.gameoverDialog.show();
  window.santaApp.fire('sound-trigger', 'pd_game_over');
  window.santaApp.fire('sound-trigger', 'music_ingame_gameover');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'presentdrop',
    score: this.scoreboard.score,
    level: this.level,
    timePlayed: Date.now() - this.gameStartTime
  });
};

/**
 * Pauses/unpauses the game.
 */
app.Game.prototype.togglePause = function() {
  if (this.paused) {
    this.resume();
  // Only allow pausing if the game is playing (not game over).
  } else if (this.isPlaying) {
    this.pause();
  }
};

/**
 * Pause the game.
 */
app.Game.prototype.pause = function() {
  this.paused = true;
  this.freezeGame();
};

/**
 * Resume the game.
 */
app.Game.prototype.resume = function() {
  this.paused = false;
  this.unfreezeGame();
};

/**
 * Detects scene size and manages scale. Updates on window resize.
 * @private
 */
app.Game.prototype.watchSceneSize_ = function() {
  var win = $(window);

  var updateSize = function() {
    var width = win.width();
    var height = win.height() - window.santaApp.headerSize;
    var scale = width < 890 ? width / 890 : 1;
    scale = height < 660 ? Math.min(height / 640, scale) : scale;
    this.setScale(scale);
  }.bind(this);

  updateSize();
  $(window).on('resize.presentdrop', updateSize);
};

/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'presentdrop',
      timePlayed: Date.now() - this.gameStartTime,
      level: this.level
    });
  }
  this.freezeGame();

  window.cancelAnimationFrame(this.requestId);
  $(window).off('.presentdrop');
  $(document).off('.presentdrop');
  this.elem.off('.presentdrop');

  this.tutorial.dispose();
  app.Chimney.pool_ = [];
  app.Present.pool_ = [];
};
