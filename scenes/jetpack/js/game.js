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

goog.require('app.Background');
goog.require('app.Cloud');
goog.require('app.Constants');
goog.require('app.Controls');
goog.require('app.DangerItem');
goog.require('app.Goal');
goog.require('app.Player');
goog.require('app.ScoreItem');
goog.require('app.TimeItem');
goog.require('app.shared.Gameover');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Tutorial');



/**
 * Main game class.
 * @param {!Element} elem DOM element containing the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);

  this.itemsElem = this.elem.find('.items');
  this.bgElem = this.elem.find('.bg');
  this.sceneElem = this.elem.find('.scene');
  this.cloudsElem = this.elem.find('.clouds');

  this.sceneSize = { width: 0, height: 0 };
  this.entities = [];
  this.isPlaying = false;
  this.paused = false;
  this.hidden = false;
  this.scale = 1;
  this.watchSceneSize_();
  this.gameStartTime = +new Date;

  this.background = new app.Background(this.elem.find('.background'));
  this.goal = new app.Goal(this.elem.find('.goal'), this);
  this.player = new app.Player(this, this.elem.find('.player'));
  this.scoreboard = new app.shared.Scoreboard(this, this.elem.find('.board'), app.Constants.TOTAL_LEVELS);
  this.gameoverView = new app.shared.Gameover(this, this.elem.find('.gameover'));
  this.tutorial = new app.shared.Tutorial(this.elem, 'touch-updown', 'keys-leftright keys-updown', 'spacenav-leftright spacenav-updown');
  this.controls = new app.Controls(this);

  // Cache a bound onFrame since we need it each frame.
  this.onFrame_ = this.onFrame_.bind(this);

  this.preloadPools_();
};


/**
 * Create some skies and items at startup so we don't suffer performance penalty
 * during gameplay on android browsers.
 * @private
 */
app.Game.prototype.preloadPools_ = function() {
  // We shouldn't need more than 12 items during gameplay.
  for (var i = 0; i < 12; i++) {
    app.ScoreItem.pool(this);
    app.DangerItem.pool(this);
  }

  // Or 20 clouds during gameplay.
  for (i = 0; i < 20; i++) {
    app.Cloud.pool(this);
  }

  app.TimeItem.pool(this);
  app.TimeItem.pool(this);
};


/**
 * Starts the game. Should only be called once.
 */
app.Game.prototype.start = function() {
  this.controls.start();
  this.restart();
  this.tutorial.start();
};


/**
 * Restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  // Cleanup last game
  this.entities.forEach(function(e) { e.remove(); });
  this.entities = [];

  // Reset the sky animation
  this.bgElem.find('.sky').remove();
  this.bgElem.prepend('<div class="sky"></div>');

  // Reset game state
  this.level = 0;
  this.nextLevel = app.Constants.LEVEL_DURATION;
  this.paused = false;
  this.isFinished = false;
  this.nextItem = 0;
  this.nextDanger = 0;
  this.nextClock = 0;
  this.nextCloud = 0;

  this.background.reset();
  this.goal.reset();
  this.scoreboard.reset();
  this.scoreboard.setLevel(this.level);
  this.player.reset();
  this.controls.reset();
  window.santaApp.fire('sound-ambient', 'music_start_ingame');
  window.santaApp.fire('sound-trigger', 'jp_start_game');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'jetpack'});

  // Start game
  this.unfreezeGame();
};


/**
 * Runs every frame. Calculates a delta and allows each game entity to update itself.
 * @private
 */
app.Game.prototype.onFrame_ = function() {
  if (!this.isPlaying) {
    return;
  }

  var now = +new Date() / 1000,
      delta = now - this.lastFrame;
  this.lastFrame = now;

  this.background.onFrame(delta);
  this.controls.onFrame(delta);
  this.player.onFrame(delta);

  if (!this.isFinished) {
    this.scoreboard.onFrame(delta);
    this.updateItems_(delta);
    this.updateDanger_(delta);
    this.updateClocks_(delta);
    this.updateClouds_(delta);
  }

  this.updateLevel_(delta);

  // Update entities
  for (var i = 0, entity; entity = this.entities[i]; i++) {
    entity.onFrame(delta);

    if (entity.dead) {
      this.entities.splice(i--, 1);
    }
  }

  // Request next frame.
  this.requestId = utils.requestAnimFrame(this.onFrame_);
};


/**
 * Scale the game down for smaller resolutions.
 * @param {number} scale A scale between 0 and 1 on how much to scale.
 */
app.Game.prototype.setScale = function(scale) {
  this.scale = scale;
  if (scale < 1) {
    this.sceneElem.css('transform', 'scale(' + scale + ')');
  } else {
    this.sceneElem.removeAttr('style');
  }
};


/**
 * Spawns a new item at regular interval.
 * @param {number} delta Seconds since last frame.
 * @private
 */
app.Game.prototype.updateItems_ = function(delta) {
  this.nextItem -= delta;
  if (this.nextItem > 0) return;

  // Create item
  this.entities.push(app.ScoreItem.pop(this));

  // Schedule next item.
  var interval = app.Constants.ITEM_SPAWN_INTERVAL *
          Math.pow(app.Constants.ITEM_SPAWN_MULTIPLY_EACH_LEVEL, this.level),
      variance = app.Constants.ITEM_SPAWN_VARIANCE *
          Math.pow(app.Constants.ITEM_SPAWN_MULTIPLY_EACH_LEVEL, this.level);
  this.nextItem = (interval - variance / 2) + Math.random() * variance;
};


/**
 * Spawns a new clock at a regular interval.
 * @param {number} delta Seconds since last frame.
 * @private
 */
app.Game.prototype.updateClocks_ = function(delta) {
  this.nextClock -= delta;
  if (this.nextClock > 0) return;

  // Create Clock
  this.entities.push(app.TimeItem.pop(this));

  // Schedule next item.
  var interval = app.Constants.CLOCK_SPAWN_INTERVAL *
          Math.pow(app.Constants.CLOCK_SPAWN_MULTIPLY_EACH_LEVEL, this.level),
      variance = app.Constants.CLOCK_SPAWN_VARIANCE *
          Math.pow(app.Constants.CLOCK_SPAWN_MULTIPLY_EACH_LEVEL, this.level);
  this.nextClock = (interval - variance / 2) + Math.random() * variance;
};


/**
 * Spawns a new clock at a regular interval.
 * @param {number} delta Seconds since last frame.
 * @private
 */
app.Game.prototype.updateDanger_ = function(delta) {
  this.nextDanger -= delta;
  if (this.level < app.Constants.DANGER_LEVEL_START || this.nextDanger > 0) return;

  this.entities.push(app.DangerItem.pop(this));

  var interval = app.Constants.DANGER_SPAWN_INTERVAL / Math.pow(!this.level ? 1 : this.level, 1.2);
  this.nextDanger = interval + Math.random() * app.Constants.DANGER_SPAWN_VARIANCE;
};


/**
 * Spawns a new cloud at regular interval.
 * @param {number} delta Seconds since last frame.
 * @private
 */
app.Game.prototype.updateClouds_ = function(delta) {
  this.nextCloud -= delta;
  if (this.nextCloud > 0) {
    return;
  }

  // Create cloud
  var cloud = app.Cloud.pop(this);
  this.entities.push(cloud);

  // Schedule next item.
  var interval = app.Constants.CLOUD_SPAWN_INTERVAL,
      variance = app.Constants.CLOUD_SPAWN_VARIANCE;
  this.nextCloud = (interval - variance / 2) + Math.random() * variance;
};


/**
 * Updates the current level on each frame.
 * @param {number} delta Seconds since last frame.
 * @private
 */
app.Game.prototype.updateLevel_ = function(delta) {
  this.nextLevel -= delta;
  if (this.nextLevel > 0) {
    return;
  }

  // Next level
  this.level++;

  if (this.level === app.Constants.TOTAL_LEVELS) {
    this.isFinished = true;
    this.goal.transition();
    return;
  }

  this.background.transition();
  this.scoreboard.setLevel(this.level);

  // Schedule next level.
  this.nextLevel = app.Constants.LEVEL_DURATION;
};


/**
 * Iterates over all collidable entities and calls a callback with it.
 * @param {function(!Item)} callback A function which processes each collidable.
 */
app.Game.prototype.forEachCollidable = function(callback) {
  for (var i = 0, entity; entity = this.entities[i]; i++) {
    if (entity instanceof app.Item && !entity.isHit) {
      callback(entity);
    }
  }
};


/**
 * Gets called when the player catches an item. Bumps the scoreboard and time.
 * @param {number} score The score received.
 * @param {number} time Additional time gained.
 */
app.Game.prototype.caughtItem = function(score, time) {
  this.scoreboard.addScore(score);
  this.scoreboard.addTime(time);
};


/**
 * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
 * Used both for game over and pausing.
 */
app.Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.elem.addClass('frozen');
};


/**
 * Unfreezes the game.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.isPlaying = true;
    this.elem.removeClass('frozen').focus();

    // Restart the onFrame loop
    this.lastFrame = +new Date() / 1000;
    this.requestId = utils.requestAnimFrame(this.onFrame_);
  }
};


/**
 * Stops the game as game over. Displays the game over screen as well.
 */
app.Game.prototype.gameover = function() {
  this.freezeGame();
  this.gameoverView.show();
  window.santaApp.fire('sound-trigger', 'jp_game_over');
  window.santaApp.fire('sound-trigger', 'music_ingame_gameover');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'jetpack',
    score: this.scoreboard.score,
    level: this.level,
    timePlayed: new Date - this.gameStartTime
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
 * Manages a cache of the scene size. Updates on window resize.
 * @private
 */
app.Game.prototype.watchSceneSize_ = function() {
  var size = this.sceneSize,
      game = this;

  var updateSize = function() {
    var width = window.innerWidth,
        height = window.innerHeight - window.santaApp.headerSize,
        scale = width < 980 ? width / 980 : 1;
    game.setScale(scale);

    size.height = height * (1 / game.scale);
    size.width = width * (1 / game.scale);
  };

  updateSize();
  $(window).on('resize.jetpack', updateSize);
};


/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'jetpack',
      timePlayed: new Date - this.gameStartTime,
      level: this.level
    });
  }
  this.freezeGame();

  utils.cancelAnimFrame(this.requestId);
  $(window).off('.jetpack');
  $(document).off('.jetpack');
  this.elem.off('.jetpack');

  this.tutorial.dispose();
  app.Cloud.pool_ = [];
  app.Item.pool_ = [];
  app.ScoreItem.pool_ = [];
  app.DangerItem.pool_ = [];
  app.TimeItem.pool_ = [];
};

