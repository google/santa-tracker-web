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

goog.require('b2');
goog.require('app.shared.Coordinator');
goog.require('app.shared.Gameover');
goog.require('app.shared.LevelUp');
goog.require('app.shared.pools');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Tutorial');



/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);

  //this.scoreboard = new app.shared.Scoreboard(this, this.elem.find('.board'));
  //this.gameoverView = new app.shared.Gameover(this, this.elem.find('.gameover'));
  //this.levelUp = new app.shared.LevelUp(this, this.elem.find('.levelup'), this.elem.find('.levelup--number'));

  //this.tutorial = new app.shared.Tutorial(this.elem, 'device-tilt', 'keys-leftright');
  
  //this.debug = !!location.search.match(/[?&]debug=true/);
  //this.gameStartTime = +new Date;

  // Cache a bound onFrame since we need it each frame.
  //this.onFrame_ = this.onFrame_.bind(this);
  
  //this.watchSceneSize_();
};



/**
 * Game loop. Runs every frame using requestAnimationFrame.
 * @private
 */
app.Game.prototype.onFrame_ = function() {
  if (!this.isPlaying) {
    return;
  }

  // Calculate delta since last frame.
  var now = +new Date() / 1000;
  var delta = Math.min(1, now - this.lastFrame);
  this.lastFrame = now;

  // Update game state with physics simulations.
  this.update(delta);

  // Render game state.

  this.scoreboard.onFrame(delta);

  // Box2D can draw it's world using canvas.
  if (this.debug) {
    this.boxWorld.DrawDebugData();
  }

  // Request next frame
  this.requestId = utils.requestAnimFrame(this.onFrame_);
};

/**
 * Updates game state since last frame.
 * @param {number} totalDelta
 */
app.Game.prototype.update = function(totalDelta) {
  while (totalDelta > 0.0001) {
    var delta = Math.min(totalDelta, app.Constants.MIN_PHYSICS_FPS);

    Coordinator.onFrame(delta);
    this.board.update(delta);
    this.boxWorld.Step(delta, 10);

    // Update spheres
    for (var i = 0, sphere; sphere = this.spheres[i]; i++) {
      sphere.update(delta);

      if (sphere.dead) {
        this.spheres.splice(i--, 1);
      }
    }

    totalDelta -= delta;
  }
};

/**
 * Transition to the next level.
 * @private
 */
app.Game.prototype.bumpLevel_ = function() {
  // Next level
  this.level++;
  var levelNumber = this.level % app.Constants.LEVELS.length;
  var cycle = Math.floor(this.level / app.Constants.LEVELS.length);
  var levelInfo = app.Constants.LEVELS[levelNumber];

  // Send Klang event
  if (this.level > 0) {
    window.santaApp.fire('sound-trigger', 'gb_level_up');
  }

  // Update time!
  var time = app.Constants.TIME_PER_LEVEL;
  time -= Math.min(20, cycle * app.Constants.LESS_TIME_PER_CYCLE);
  this.scoreboard.setLevel(this.level);
  this.scoreboard.addTime(time);

  // Load level layout
  this.board.switchToLevel(levelInfo);

  // Spawn balls
  this.availableBalls = levelInfo.balls.length;
  this.remainingBalls = levelInfo.balls.length;
  this.ballsAvailable.css('transform', 'translateZ(0) scaleX(' + 0 + ')');
  this.ballsRemaining.css('transform', 'translateZ(0) scaleX(' + (this.remainingBalls / 10) + ')');

  Coordinator.after(1, function() {
    levelInfo.balls.forEach(function(ball) {
      var sphere = app.Sphere.pop(this, 600 + ball.x);
      this.spawner.spawnSphere(sphere);
      this.spheres.push(sphere);
    }, this);
  }.bind(this));
};

/**
 * Update gameplay when a sphere has hit the target.
 * @param {!app.Sphere} sphere The ball.
 * @param {number} x X position of the ball that hit.
 * @param {number} y Y position of the ball that hit.
 */
app.Game.prototype.hitTarget = function(sphere, x, y) {
  this.remainingBalls--;
  this.ballsAvailable.css('transform', 'translateZ(0) scaleX(' + ((this.availableBalls - this.remainingBalls) / 10) + ')');
  var score = 50 * Math.max(1, this.level + 1 - sphere.respawns);
  this.scoreboard.addScore(score);
  if (this.remainingBalls === 0) {
    // Check for game end
    if (this.level === Constants.LEVELS.length - 1) {
      this.gameover();
    } else {
      this.levelUp.show(this.level + 2, this.bumpLevel_);
    }
  }
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
  
  var match = location.search.match(/[?&]level=(\d+)/) || [];
  this.level = (+match[1] || 1) - 2;
  
  //Coordinator.reset();
  //this.scoreboard.reset();

  // Start game
  window.santaApp.fire('sound-trigger', 'gb_game_start');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'presentbounce'});
};

/**
 * Stops the game as game over. Displays the game over screen as well.
 */
app.Game.prototype.gameover = function() {
  this.gameoverView.show();
  window.santaApp.fire('sound-trigger', 'gb_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'presentbounce',
    score: this.scoreboard.score,
    level: this.level,
    timePlayed: new Date - this.gameStartTime
  });
};


/**
 * Scale the game down for smaller resolutions.
 * @param {number} scale A scale between 0 and 1 on how much to scale
 * @param {number} width The width.
 * @param {number} height The height.
 */
app.Game.prototype.setScale = function(scale, width, height) {
  this.scale = scale;
  this.viewElem.css({
    transform: 'scale(' + scale + ')',
    width: width / scale + 'px',
    height: height / scale + 'px'
  });
};

/**
 * Detects scene size and manages scale. Updates on window resize.
 * @private
 */
app.Game.prototype.watchSceneSize_ = function() {
  var bgElem = this.bgElem,
      game = this;

  var updateSize = function() {
    var width = window.innerWidth,
      height = window.innerHeight,
      scale = width < 900 ? width / 900 : 1;
    scale = height < 640 ?
        Math.min(height / 640, scale) :
        scale;

    game.setScale(scale, width, height);
  };

  updateSize();
  $(window).on('resize.presentbounce', updateSize);
};

/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {gameid: 'presentbounce', timePlayed: new Date - this.gameStartTime, level: this.level});
  }
  
  utils.cancelAnimFrame(this.requestId);
  $(window).off('.presentbounce');
  $(document).off('.presentbounce');

  this.levelUp.dispose();
  this.tutorial.dispose();
  app.shared.pools.empty();
};
