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

goog.require('Constants');
goog.require('app.Boost');
goog.require('app.Controls');
goog.require('app.Finish');
goog.require('app.Obstacle');
goog.require('app.Platform');
goog.require('app.Player');
goog.require('app.Present');
goog.require('app.shared.Gameover');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Tutorial');
goog.require('app.shared.pools');
goog.require('app.shared.utils');

/**
 * Main class for the endless runner game.
 * @param {Element} context Dom element that wraps the game.
 *
 * @constructor
 * @export
 */
app.Game = function(context) {
  this.context = $(context);
  this.gameElem_ = this.context.find('.game');
  this.layersElem_ = this.context.find('.layer');
  this.layersContainerElem_ = this.context.find('.layers-wrap');
  this.entitiesLayerElem_ = this.context.find('.entities-layer');
  this.groundElem_ = this.context.find('.ground');

  this.entities = [];
  this.isPlaying = false;
  this.paused = true;
  this.started = false;

  this.player = new app.Player(this, this.context.find('.reindeer'));
  this.finish = new app.Finish(this);
  this.scoreboard = new Scoreboard(this, this.context.find('.board'));
  this.gameoverDialog = new Gameover(this, this.context.find('.gameover'));
  this.tutorial = new Tutorial(this.context, 'touch-updown', 'keys-updown', 'spacenav-updown');
  this.controls = new app.Controls(this);

  this.gameSize = Constants.GAME_BASE_SIZE;
  this.scale = 1;
  this.watchSceneSize_();

  // Cache a bound onFrame since we need it each frame.
  this.onFrame = this.onFrame.bind(this);

  this.preloadPools_();
};

/**
 * Create some entities at startup so we don't suffer performance penalty
 * during gameplay on android browsers.
 * @private
 */
app.Game.prototype.preloadPools_ = function() {
  // Prepare 40 presents.
  for (var i = 0; i < 40; i++) {
    app.Present.pool(this);
  }

  // Prepare 5 obstacles.
  for (i = 0; i < 5; i++) {
    app.Obstacle.pool(this);
  }

  // Prepare 10 platforms.
  for (i = 0; i < 10; i++) {
    app.Platform.pool(this);
  }

  // Prepare 3 boosts.
  for (i = 0; i < 3; i++) {
    app.Boost.pool(this);
  }
};

/**
 * Starts the game.
 * @export
 */
app.Game.prototype.start = function() {
  this.tutorial.start();
  this.started = true;
  this.restart();
};

/**
 * Reset and restart the game.
 */
app.Game.prototype.restart = function() {
  // Cleanup last game
  this.entities.forEach(function(e) {
    if (e.remove) {
      e.remove();
    }
  });
  this.entities = [];

  this.scoreboard.reset();
  this.hurryUpPlayed = false;

  // Number of pixels to advance entities per second.
  this.speed = Constants.GAME_SPEED;
  // Total number of pixels the game layer has advanced.
  this.distanceTraveled = 0;
  this.lastObstaclePos = 0;
  this.lastBoostPos = 0;
  this.lastEntityPos = 1000;
  this.magnetMode = false;

  Coordinator.reset();
  this.paused = false;
  this.player.reset();

  this.unfreezeGame();
  window.santaApp.fire('analytics-track-game-start', {gameid: 'runner'})
  window.santaApp.fire('sound-trigger', 'runner_start');

  this.gameStartTime = +new Date;

  this.finishLinePos = Constants.INITIAL_COUNTDOWN * this.speed;
  this.finish.place(this.finishLinePos);
  this.entities.push(this.finish);
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
  if (this.started) {
    this.paused = false;
    this.unfreezeGame();
  }
};

/**
 * Stops the onFrame loop and stops all relevant CSS3 animations.
 * Used by pause and gameover.
 */
app.Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.gameElem_.addClass('frozen');
};

/**
 * Starts the onFrame loop and enables CSS3 animations.
 * Used by unpause and restart.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.gameElem_.removeClass('frozen');

    this.isPlaying = true;
    this.lastFrame = +new Date() / 1000;
    this.requestId = utils.requestAnimFrame(this.onFrame);
  }
};

/**
 * Called by the scoreboard to stop the game when the time is up.
 */
app.Game.prototype.gameover = function() {
  this.freezeGame();
  this.gameoverDialog.show();
  window.santaApp.fire('sound-trigger', 'runner_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'runner',
    score: this.scoreboard.score,
    level: 1 /* level */,
    timePlayed: new Date - this.gameStartTime
  })
;
};

/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'runner',
      timePlayed: new Date - this.gameStartTime,
      level: 1
    });
  }
  this.freezeGame();

  app.shared.utils.cancelAnimFrame(this.requestId);
  $(window).off('.endlessrunner');
  $(document).off('.endlessrunner');
  this.context.off('.endlessrunner');

  app.shared.pools.empty();
  this.tutorial.dispose();
  Coordinator.waiting = [];
};

/**
 * Called each frame.
 */
app.Game.prototype.onFrame = function() {
  if (!this.isPlaying) {
    return;
  }

  // Calculate delta
  var now = +new Date() / 1000,
    delta = now - this.lastFrame;
  this.lastFrame = now;

  Coordinator.onFrame(delta);

  this.distanceTraveled += delta * this.speed;
  this.scoreboard.onFrame(delta);
  if (this.scoreboard.countdown < 10 && !this.hurryUpPlayed) {
    window.santaApp.fire('sound-trigger', 'runner_hurry_up');
    this.hurryUpPlayed = true;
  }

  this.player.onFrame(delta);
  this.updateEntities(delta);

  this.entitiesLayerElem_
      .css('transform', 'translate3d(' + -this.distanceTraveled + 'px, 0, 0)');

  var groundWidth = parseInt(this.groundElem_.css('width'));
  var groundWidthScaled = groundWidth * this.scale;
  if (this.distanceTraveled + this.visibleWidth > groundWidth) {
    this.groundElem_.css('width', (groundWidth * 2) + 'px');
  }

  // Update entities and track which are dead.
  var deadEntities = [];
  for (var i = 0, entity; entity = this.entities[i]; i++) {
    entity.onFrame();

    if (entity.dead) {
      deadEntities.push(i);
    }
  }

  // Cleanup dead entities
  for (var i = 0, deadEntity; (deadEntity = deadEntities[i]) != null; i++) {
    this.entities.splice(deadEntity - i, 1);
  }

  this.requestId = app.shared.utils.requestAnimFrame(this.onFrame);
};

/**
 * Updates on window resize.
 * @private
 */
app.Game.prototype.watchSceneSize_ = function() {
  var size = this.gameSize,
      gameElem = this.gameElem_,
      layersElem = this.layersElem_,
      game = this;

  var updateSize = function() {
    var height = gameElem.height();
    var scale = Math.min(Constants.GAME_MAX_SCALE, height / size.height);
    game.setScale(scale, gameElem.width());
  };

  updateSize();
  $(window).on('resize.endlessrunner', updateSize);
};

/**
 * Scale game to fit viewport.
 * @param {number} scale Amount to scale.
 * @param {number} width Width of the viewport.
 */
app.Game.prototype.setScale = function(scale, width) {
  var newWidth = Math.max(width, Constants.GAME_BASE_SIZE.width) +
      Constants.GAME_BASE_SIZE.width;
  if (scale < 1) {
    newWidth *= (1 / scale);
  }

  this.layersContainerElem_.css('transform', 'scale(' + scale + ')');
  this.layersElem_.css('width', newWidth + 'px');

  this.scale = scale;
  this.visibleWidth = width * (1 / scale);
};

/**
 * Add more entities to the end of the game layer. Called each frame.
 */
app.Game.prototype.updateEntities = function() {
  // Populate the game with entities up to the end of the viewport
  var pos = this.lastEntityPos + Constants.GAME_ENTITY_SPACING;
  if (pos < this.finishLinePos - Constants.FINISH_LINE_BUFFER &&
      this.lastEntityPos < this.distanceTraveled + this.visibleWidth) {
    var random = Math.random();
    if (random < 0.2) {
      this.lastEntityPos = this.addObstacle(pos, 0);
    } else if (random < 0.5) {
      this.lastEntityPos = this.addPresents(pos);
    } else if (random < 0.75) {
      this.lastEntityPos = this.addPlatforms(pos);
    } else if (random < 0.9) {
      this.lastEntityPos = this.addBoost(pos);
    }else {
      // Leave some space empty sometimes.
      this.lastEntityPos += Math.floor(Math.random() * 1000);
    }
  }
};

/**
 * Add platforms to the end of the game layer.
 * @param {number} pos The position to start adding at, in total game distance.
 * @return {number} The position after the last added platform.
 */
app.Game.prototype.addPlatforms = function(pos) {
  var numShort = Math.ceil(Math.random() * 3);
  var numTall = Math.floor(Math.random() * 3);
  var woodsy = false;
  var i;

  if (Math.random() < 0.25) {
    woodsy = true;
  }

  for (i = 0; i < numShort; i++) {
    pos = this.addPlatform(pos, 0, woodsy);
  }

  pos -= 150;
  for (i = 0; i < numTall; i++) {
    pos = this.addPlatform(pos, 1, woodsy, i == 0);
  }

  return pos;
};

/**
 * Adds one platform to the end of the game layer.
 * @param {number} pos The position to add at, in total game distance.
 * @param {number} level  What level the platform height should be.
 * @param {boolean} woodsy Whether to use the nature terrain style platform.
 * @param {boolean} opt_noExtraPresents Whether to allow ground level presents
 *                                      in front of this platform.
 * @return {number} The position for the next platform.
 */
app.Game.prototype.addPlatform = function(pos, level, woodsy,
    opt_noExtraPresents) {
    var platform = app.Platform.pop(this, pos, level, woodsy);
    this.entities.push(platform);

    var random = Math.random();
    if (random < 0.25) {
      this.addPresents(pos, platform, (level + 1) *
          Constants.PLATFORM_HEIGHT + 75);
    } else if (random < 0.5 && !woodsy) {
      this.addObstacle(pos + platform.width * .66, level + 1);
    }

    if (Math.random() < 0.25 && !opt_noExtraPresents) {
      this.addPresents(pos, platform, 75);
    }

    pos += platform.width + 7;
    return pos;
};

/**
 * Add an obstacle to the end of the game layer.
 * @param {number} pos The position to start adding at, in total game distance.
 * @param {number} level The vertical level to add the platform at.
 * @return {number} The position after the last added entity.
 */
app.Game.prototype.addObstacle = function(pos, level) {
  if (this.lastObstaclePos > pos - Constants.PX_BETWEEN_OBSTACLES) {
    return this.lastEntityPos;
  }

  var obstacle = app.Obstacle.pop(this, pos, level);
  this.entities.push(obstacle);

  if (Math.random() < 0.5) {
    var levelHeight = this.getPresentHeightForLevel(level + 1);
    this.addPresents(pos, obstacle, obstacle.presentsHeight || levelHeight);
  }

  this.lastObstaclePos = pos + obstacle.width;
  return this.lastObstaclePos;
};

/**
 * Add presents to the game layer.
 * @param {number} pos        Start position of the presents.
 * @param {Object} opt_entity A game entity. If provided the space above
 *                            this will be filled with presents.
 * @param {Object} opt_height Vertical height to place the presents at.
 * @return {number} The position after the last added present.
 */
app.Game.prototype.addPresents = function(pos, opt_entity, opt_height) {
  var height = opt_height || Math.floor(Math.random() * 500 + 75);

  if (opt_entity) {
    var presentSpacing = 75;
    var totalPresentsWidth = 0;
    var presentsToAdd = [];
    while (totalPresentsWidth < opt_entity.width) {
      var present = app.Present.pop(this, 0 /* will be set later */, height);
      if (totalPresentsWidth + present.width > opt_entity.width) {
        app.Present.push(present);
        break;
      }
      presentsToAdd.push(present);
      totalPresentsWidth += present.width + presentSpacing;
    }

    // Remove extra spacing at end
    totalPresentsWidth -= presentSpacing;

    var presentStartPos = pos + (opt_entity.width - totalPresentsWidth) / 2;
    for (var i = 0; i < presentsToAdd.length; i++) {
      var present = presentsToAdd[i];
      present.setXPos(presentStartPos);
      presentStartPos += present.width + presentSpacing;
      this.entities.push(present);
    }
  } else {
    var numPresents = Math.ceil(Math.random() * 3 + 2);
    var numRows = Math.ceil(Math.random() * 4);
    var presentSpacing = 150;

    for (var i = 0; i < numPresents; i++) {
      for (var j = 0; j < numRows; j++) {
        var presentX = pos + (j % 2) * (presentSpacing / 2);
        var presentY = height + (presentSpacing / 2) * j;
        var present = app.Present.pop(this, presentX, presentY);
        this.entities.push(present);
      }
      pos += 150;
    }
  }

  return pos;
};

/**
 * Add a Boost to the game layer.
 * @param {number} pos Position to place the boost.
 * @return {number} The position after the last added entity.
 */
app.Game.prototype.addBoost = function(pos) {
  if (this.lastBoostPos > pos - Constants.PX_BETWEEN_BOOSTS) {
    return this.lastEntityPos;
  }
  var boost = app.Boost.pop(this, pos, Math.floor(Math.random() * 500 + 75));
  this.entities.push(boost);

  this.lastBoostPos = pos + boost.width;
  return this.lastBoostPos;
};

/**
 * Called by a present when it is hit to record its score.
 * @param  {app.Present} present The present.
 */
app.Game.prototype.hitPresent = function(present) {
  this.scoreboard.addScore(present.score);
};

/**
 * @param  {number} level The level.
 * @return {number} The height for a present at this vertical level.
 */
app.Game.prototype.getPresentHeightForLevel = function(level) {
  return level * Constants.PLATFORM_HEIGHT + 75;
};

/**
 * Add game time.
 * @param {number} time Number of seconds to add.
 */
app.Game.prototype.addTime = function(time) {
  if (this.scoreboard.countdown < 10 && this.scoreboard.countdown + time > 10) {
    window.santaApp.fire('sound-trigger', 'hurry_up_end');
    this.hurryUpPlayed = false;
  }
  this.scoreboard.addTime(time);
  this.finishLinePos += time * this.speed;
  this.finish.place(this.finishLinePos);
};
