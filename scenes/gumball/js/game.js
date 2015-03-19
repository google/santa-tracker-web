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
goog.require('app.Board');
goog.require('app.Constants');
goog.require('app.Controls');
goog.require('app.Spawner');
goog.require('app.Sphere');

/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);

  this.boardElem = this.elem.find('.gameboard');
  this.spheresElem = this.elem.find('.spheres');
  this.bgElem = this.elem.find('.bg');
  this.viewElem = this.elem.find('.scene');

  /** @type {Spawner} */
  this.spawner = new app.Spawner(this, this.elem.find('.ceiling-pipe'));
  this.ballsRemaining = this.elem.find('.js-balls-remaining');
  this.ballsAvailable = this.elem.find('.js-balls-available');
  this.scoreboard = new app.shared.Scoreboard(this, this.elem.find('.board'));
  this.gameoverView = new app.shared.Gameover(this, this.elem.find('.gameover'));
  this.levelUp = new app.shared.LevelUp(this,
      this.elem.find('.levelup'), this.elem.find('.levelup--number'));

  this.tutorial = new app.shared.Tutorial(this.elem, 'device-tilt', 'keys-leftright');
  this.controls = new app.Controls(this);
  this.spheres = [];
  this.isPlaying = false;
  this.paused = false;
  this.hidden = false;
  this.scale = 1;
  this.debug = !!location.search.match(/[?&]debug=true/);
  this.gameStartTime = +new Date;

  this.createBoxWorld_();
  this.board = new app.Board(this, this.boardElem);

  // Cache a bound onFrame since we need it each frame.
  this.onFrame_ = this.onFrame_.bind(this);
  this.bumpLevel_ = this.bumpLevel_.bind(this);

  this.watchSceneSize_();
  this.preloadSpheres_();
};

/**
 * Create a few spheres so we don't run into GPU transfer mid-gameplay.
 * @private
 */
app.Game.prototype.preloadSpheres_ = function() {
  // Prepare 10 spheres.
  for (var i = 0; i < 10; i++) {
    app.Sphere.pool(this);
  }
};

/**
 * Create the box2d world along with static geometry.
 * @private
 */
app.Game.prototype.createBoxWorld_ = function() {
  this.boxWorld = new b2.World(new b2.Vec2(0.0, 20.0), false);

  if (this.debug) {
    var debugCanvas = $('<canvas>')
      .css({
        position: 'absolute',
        zIndex: 100,
        left: '50%',
        top: '50%',
        margin: '-450px 0 0 -600px'
      })
      .attr({
        width: 1200,
        height: 900
      })
      .appendTo(this.viewElem);

    var debugDraw = new b2.DebugDraw();
    debugDraw.SetSprite(debugCanvas[0].getContext('2d'));
    debugDraw.SetDrawScale(100);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetFlags(b2.DebugDraw.e_shapeBit);
    this.boxWorld.SetDebugDraw(debugDraw);
  }

  // Static scene.
  var bd = new b2.BodyDef();
  bd.type = b2.Body.b2_staticBody;
  bd.userData = 'floor';
  bd.position.Set(6, 4.5);
  this.staticBody = this.boxWorld.CreateBody(bd);

  var fixtureDef = new b2.FixtureDef();
  fixtureDef.shape = new b2.PolygonShape();

  // Floor tunnels
  fixtureDef.userData = 'floor';
  fixtureDef.shape.SetAsOrientedBox(4.00, 0.08, new b2.Vec2(-5.21, 3.04));
  this.staticBody.CreateFixture(fixtureDef);

  fixtureDef.shape.SetAsOrientedBox(4.00, 0.08, new b2.Vec2(5.21, 3.04));
  this.staticBody.CreateFixture(fixtureDef);

  // Funnel sides
  fixtureDef.userData = null;
  fixtureDef.shape.SetAsArray([
    new b2.Vec2(-1.21, 3.12),
    new b2.Vec2(-1.21, 2.61),
    new b2.Vec2(-0.94, 3.12)
  ]);
  this.staticBody.CreateFixture(fixtureDef);

  fixtureDef.shape.SetAsArray([
    new b2.Vec2(1.21, 3.12),
    new b2.Vec2(0.94, 3.12),
    new b2.Vec2(1.21, 2.61)
  ]);
  this.staticBody.CreateFixture(fixtureDef);

  // Hit train
  fixtureDef.userData = 'funnel';
  fixtureDef.shape.SetAsOrientedBox(2.30, 0.08, new b2.Vec2(0, 3.38));
  this.staticBody.CreateFixture(fixtureDef);

  // Out of bounds.
  fixtureDef.userData = 'oob';
  fixtureDef.shape.SetAsOrientedBox(0.08, 4, new b2.Vec2(-6.60, 0.00));
  this.staticBody.CreateFixture(fixtureDef);

  fixtureDef.shape.SetAsOrientedBox(0.08, 4, new b2.Vec2(6.60, 0.00));
  this.staticBody.CreateFixture(fixtureDef);

  // Collision handling for sphere.
  this.boxWorld.SetContactListener({
    BeginContact: function(contact) {
      var data = this.getInterestingData(contact);
      if (data) {
        data[0].onContact(data[1].GetUserData());
      }
    },
    EndContact: function() {},
    PreSolve: function() {},
    PostSolve: function(contact, impulse) {
      // Only trigger sounds for hard collisions.
      if (impulse.normalImpulses[0] < 0.3) {
        return;
      }

      var data = this.getInterestingData(contact);
      var other = data && data[1].GetUserData();
      if (other === 'floor' || other === 'cone') {
        window.santaApp.fire('sound-trigger', {name: 'gb_ball_bounce', args: [impulse.normalImpulses[0]]});
      }
    },
    /**
     * If a contact is between a sphere and some other form, we
     * return an array with the sphere and the other fixture.
     * @param {b2.Contact} contact to process
     * @return {Array} Either undefined or [sphere, otherFixture] array.
     */
    getInterestingData: function(contact) {
      var sphere = contact.GetFixtureA().GetBody().GetUserData();
      if (sphere && sphere instanceof app.Sphere) {
        return [sphere, contact.GetFixtureB()];
      }

      sphere = contact.GetFixtureB().GetBody().GetUserData();
      if (sphere && sphere instanceof app.Sphere) {
        return [sphere, contact.GetFixtureA()];
      }
    }
  });
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
  this.spawner.render();
  this.board.render();

  this.spheres.forEach(function(sphere) {
    sphere.render();
  });

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
  this.spheres.forEach(function(e) { e.remove(); });
  this.spheres = [];

  var match = location.search.match(/[?&]level=(\d+)/) || [];
  this.level = (+match[1] || 1) - 2;
  this.paused = false;

  Coordinator.reset();
  this.spawner.reset();
  this.board.reset();
  this.scoreboard.reset();

  this.bumpLevel_();

  // Start game
  window.santaApp.fire('sound-trigger', 'gb_game_start');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'gumball'});
  this.unfreezeGame();
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
 * Unfreezes the game, starting the game loop as well.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.elem.removeClass('frozen').focus();

    this.isPlaying = true;
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
  window.santaApp.fire('sound-trigger', 'gb_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'gumball',
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
  $(window).on('resize.gumball', updateSize);
};

/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {gameid: 'gumball', timePlayed: new Date - this.gameStartTime, level: this.level});
  }
  this.freezeGame();

  utils.cancelAnimFrame(this.requestId);
  $(window).off('.gumball');
  $(document).off('.gumball');

  this.levelUp.dispose();

  this.tutorial.dispose();
  app.shared.pools.empty();
};
