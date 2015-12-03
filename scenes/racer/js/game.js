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

goog.provide('SB.Game');
goog.provide('app.Game');

goog.require('Constants');
goog.require('Controls');
goog.require('SB.Assets');
goog.require('SB.Object.MarkerLine');
goog.require('SB.Object.Renderable');
goog.require('SB.Object.Rudolf');
goog.require('SB.Object.Santa');
goog.require('SB.Object.Scenery');
goog.require('SB.Object.Text');
goog.require('SB.Renderer');
goog.require('app.shared.Gameover');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.SharedGame');
goog.require('app.shared.Tutorial');
goog.require('app.shared.pools');
goog.require('app.shared.utils');

/**
 * Represents the game, captures the user input and overall game state
 * including score and level. Also runs the render loop.
 * @param {!Element} elem
 * @param {string} componentDir The path to the Racer scene directory.
 * @constructor
 * @implements SharedGame
 * @struct
 */
SB.Game = function(elem, componentDir) {
  this.elem = elem;
  SB.Assets.init(componentDir);

  this.MIN_DEADLINE = 10;

  this.level = 0;

  this.tutorial = new Tutorial(this.elem, 'touch-updown', 'keys-up keys-leftright', 'spacenav-up spacenav-leftright');
  this.controls = new Controls(this, this.tutorial);
  this.renderer = new SB.Renderer(
      /** @type {!HTMLCanvasElement} */ (elem.querySelector('canvas.game')));
  this.scoreboard = new Scoreboard(this, elem.querySelector('.board'));
  this.scoreboard.reset();
  this.scoreboard.setLevel(this.level - 1);
  this.gameoverView = new Gameover(this, elem.querySelector('.gameover'));
  this.watchSceneSize_();

  this.world = new SB.Object.Renderable();
  this.markerLine = new SB.Object.MarkerLine();
  this.santa = new SB.Object.Santa(
    {x: window.worldWidth * 0.5, y: 400}
  );
  this.rudolf = new SB.Object.Rudolf(
    {x: window.worldWidth * 0.5, y: 300}
  );
  this.scenery = new SB.Object.Scenery();

  this.paused = false;
  this.inputVector = {
    x: 0,
    y: 0
  };

  this.nextDeadline = 30;
  this.markerDistance = 6000;
  this.markerDistanceIncrease = 1000;

  this.playing = false;

  this.gameStartTime = 0;
  this.lastUpdateTime = 0;
  this.updateTime = 0;

  this.requestId = -1;

  this.update_ = this.update_.bind(this);

  this.setup_();
};


/**
 * Connects and arranges the world for rendering.
 * @private
 */
SB.Game.prototype.setup_ = function() {
  this.world.addChild(this.markerLine);
  this.world.addChild(this.scenery);
  this.world.addChild(this.rudolf);
  this.world.addChild(this.santa);

  this.world.position.x = 10;
  this.markerLine.position.y = -1000;

  this.santa.connectTo(this.rudolf);
  this.scenery.connectTo(this.world);
};

/**
 * Callback when the user clicks to start the game.
 * @private
 */
SB.Game.prototype.startGame_ = function() {
  // declare them as playing
  window.santaApp.fire('sound-trigger', 'rc_start_game');
  window.santaApp.fire('sound-ambient', 'music_start_ingame');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'racer'});
  this.gameStartTime = +new Date;
  this.controls.start();
  this.tutorial.start();
  this.unfreezeGame_();
};

/**
 * Starts the onFrame loop.
 * Used by unpause and restart.
 * @private
 */
SB.Game.prototype.unfreezeGame_ = function() {
  if (!this.playing) {
    this.elem.focus();
    this.playing = true;
    this.lastUpdateTime = +new Date;
    this.requestId = window.requestAnimationFrame(this.update_);
  }
};

/**
 * Callback for requestAnimationFrame.
 * @private
 */
SB.Game.prototype.update_ = function() {
  if (!this.playing) {
    return;
  }

  var ctx = this.renderer.context;

  // Calculate delta since last frame.
  this.updateTime = +new Date;
  var deltaSec = Math.min(1000, this.updateTime - this.lastUpdateTime) / 1000;
  this.lastUpdateTime = this.updateTime;

  if (!this.paused) {
    this.controls.onFrame(deltaSec);

    // clear the render
    this.renderer.clear();
    this.renderer.addShadowLine();

    // update Rudolf's acceleration
    this.updateRudolfFromInputs_();
    this.checkForCollisions_();

    // follow Rudolf and check if
    // he's crossed the line
    this.updateCameraPosition_();
    this.checkMarkerLine_();

    // begin rendering
    ctx.save();
    this.world.traverse(ctx);
    ctx.restore();

    // update the UI and track countdown.
    if (this.level > 0) {
      this.scoreboard.onFrame(deltaSec);
    }

    this.renderer.addMachineShadows();
  }

  // schedule the next tick
  this.requestId = window.requestAnimationFrame(this.update_);
};

/**
 * Check if Rudolf or Santa have hit the scenery or presents.
 * @private
 */
SB.Game.prototype.checkForCollisions_ = function() {
  if (this.scenery.test(this.rudolf) || this.scenery.test(this.santa)) {
    var multiplier = 1 + 0.1 * (this.level - 1);
    var score = Math.floor(Constants.PRESENT_HIT_SCORE * multiplier);
    this.scoreboard.addScore(score);
    this.scenery.addScore(score);
  }
};

/**
 * Detects scene size and manages scale. Updates on window resize.
 * @private
 */
SB.Game.prototype.watchSceneSize_ = function() {
  var moduleElem = $(this.elem);
  var viewElem = moduleElem.find('.view');
  var updateSize = function() {
    var width = window.innerWidth,
      height = window.innerHeight - window.santaApp.headerSize,
      scale = width < 900 ? width / 900 : 1;
    scale = height < 640 ?
      Math.min(height / 640, scale) :
      scale;

    viewElem.css({
      transform: 'scale(' + scale + ')',
      width: width / scale + 'px',
      height: height / scale + 'px'
    });
  };

  updateSize();
  $(window).on('resize.racer', updateSize);
};

/**
 * Moves the notional camera to track Rudolf.
 * @private
 */
SB.Game.prototype.updateCameraPosition_ = function() {
  this.world.position.y = ((this.rudolf.position.y * -1) + 400);
};

/**
 * Updates Rudolf's acceleration based on the
 * last known keyboard events.
 * @private
 */
SB.Game.prototype.updateRudolfFromInputs_ = function() {
  if (this.inputVector.x !== 0) {
    this.rudolf.turn(this.inputVector.x * 0.07);
  } else {
    this.rudolf.turn(-this.rudolf.targetRotation * 0.07);
  }

  if (this.inputVector.y < 0) {
    this.rudolf.accelerate(-this.inputVector.y * 0.1);
  } else if (this.inputVector.y > 0) {
    this.rudolf.decelerate(this.inputVector.y * 0.1);
  } else {
    this.rudolf.decelerate(0.1);
  }
};

/**
 * Checks if Santa has crossed the line. If he
 * has then we up the level and score.
 * @private
 */
SB.Game.prototype.checkMarkerLine_ = function() {

  if (!this.markerLine.triggered &&
    this.santa.position.y <= this.markerLine.position.y) {

    this.level++;

    // add some points for crossing the
    // line, increment the level and
    // then add some time for the deadline
    var multiplier = 1 + 0.1 * (this.level - 1);
    this.scoreboard.addScore(Math.floor(Constants.LEVEL_UP_SCORE * multiplier));

    // Limit levels
    if (this.level === Constants.TOTAL_LEVELS + 1) {
      this.gameover();
      return;
    }

    this.scoreboard.setLevel(this.level - 1);

    // Only add time in level 2
    if (this.level >= 2) {
      this.scoreboard.addTime(this.nextDeadline);
    }

    // Don't show level number for last level
    if (this.level === Constants.TOTAL_LEVELS) {
      this.markerLine.showLevel = false;
    }

    this.markerLine.triggered = true;
    this.markerLine.center = 0;
    this.markerLine.level = this.level + 1;
    window.santaApp.fire('sound-trigger', 'rc_player_level_up');

    // reduce how much time they have until
    // the deadline for the next time they cross
    // the line
    this.nextDeadline -= 5;
    this.nextDeadline = Math.max(this.nextDeadline, this.MIN_DEADLINE);
  }

  if (!this.markerLine.center &&
      Math.abs(this.world.position.y + this.markerLine.position.y + 314) < 10) {
    this.markerLine.center = this.scenery.getCenter();
  }

  if (this.world.position.y + this.markerLine.position.y > window.worldHeight) {
    this.markerLine.position.y -= this.markerDistance;
    this.markerLine.triggered = false;
    this.markerDistance += this.markerDistanceIncrease;
  }
};

/**
 * Callback for when all the assets have loaded and the
 * game is to be initialized.
 * @export
 */
SB.Game.prototype.initialize = function() {
  this.startGame_();
};

/**
 * Restarts the game.
 */
SB.Game.prototype.restart = function() {
  window.santaApp.fire('sound-trigger', 'rc_start_game');
  window.santaApp.fire('sound-ambient', 'music_start_ingame');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'racer'});
  this.gameStartTime = +new Date;

  // reset the scenery
  this.scenery.reset();

  // santa
  this.santa.position.x = window.worldWidth * 0.5;
  this.santa.position.y = 400;
  this.santa.rotation = 0;
  this.santa.velocity.x = 0;
  this.santa.velocity.y = 0;

  // rudolf
  this.rudolf.position.x = window.worldWidth * 0.5;
  this.rudolf.position.y = 300;
  this.rudolf.targetRotation = 0;
  this.rudolf.rotation = 0;
  this.rudolf.targetVelocity = 0;
  this.rudolf.velocity = 0;

  // game stats
  this.level = 0;
  this.paused = false;
  this.scoreboard.setLevel(this.level - 1);
  this.scoreboard.reset();

  // markers
  this.nextDeadline = 30;
  this.markerDistance = 6000;
  this.markerLine.position.y = -500;
  this.markerLine.reset();

  window.santaApp.fire('sound-trigger', 'rc_start_game');

  this.unfreezeGame_();
};

/**
 * Called when the module is exited.
 * @export
 */
SB.Game.prototype.dispose = function() {
  if (this.playing) {
    window.santaApp.fire('analytics-track-game-quit',
                         {gameid: 'racer', timePlayed: new Date - this.gameStartTime,
                          level: this.level});
  }
  this.playing = false;

  window.cancelAnimationFrame(this.requestId);
  $(window).off('.racer');
  $(this.elem).off('.racer');

  this.tutorial.dispose();
};

/**
 * Called when the user runs out of time.
 */
SB.Game.prototype.gameover = function() {
  if (this.playing) {
    this.playing = false;
    window.santaApp.fire('sound-trigger', 'rc_game_over');
    window.santaApp.fire('sound-trigger', 'music_ingame_gameover');
    window.santaApp.fire('sound-trigger', {name: 'rc_sled_speed', args: [0]});

    window.santaApp.fire('analytics-track-game-over', {
      gameid: 'racer',
      score: this.scoreboard.score,
      level: this.level,
      timePlayed: new Date - this.gameStartTime
    });

    this.gameoverView.show(this.scoreboard.score, this.level);
  }
};

/**
 * Pauses the game.
 */
SB.Game.prototype.togglePause = function() {
  this.paused = !this.paused;
};

/**
 * Pause the game.
 */
SB.Game.prototype.pause = function() {
  this.paused = true;
};

/**
 * Unpause the game.
 */
SB.Game.prototype.resume = function() {
  this.paused = false;
};

/**
 * The pause status.
 * @return {boolean}
 */
SB.Game.prototype.isPaused = function() {
  return this.paused;
};

/**
 * Export Game object.
 * @export
 */
app.Game = SB.Game;
