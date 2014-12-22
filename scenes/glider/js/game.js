goog.provide('app.Game');

goog.require('Constants');
goog.require('app.Building');
goog.require('app.Chimney');
goog.require('app.Cloud');
goog.require('app.Collision');
goog.require('app.Controls');
goog.require('app.Entity');
goog.require('app.Item');
goog.require('app.Obstacle');
goog.require('app.Player');
goog.require('app.Present');
goog.require('app.shared.Gameover');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Tutorial');
goog.require('app.utils');


/**
 * Main game class.
 * @param {Element} elem DOM element containing the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.root = new app.Entity();

  this.elem = $(elem);
  this.itemsElem = this.elem.find('.items');
  this.bgElem = this.elem.find('.bg');
  this.sceneElem = this.elem.find('.scene');
  this.cloudsElem = this.elem.find('.clouds');
  this.buildingsElem = this.elem.find('.buildings');
  this.obstaclesElem = this.elem.find('.obstacles');
  this.presentsElem = this.elem.find('.presents');
  this.collisionsElem = this.elem.find('.collisions');

  this.sceneSize = { width: 0, height: 0 };
  this.isPlaying = false;
  this.paused = false;
  this.hidden = false;
  this.isMobile = Modernizr.touch;
  this.scale = 1;
  this.watchSceneSize_();
  this.gameStartTime = +new Date;

  this.player = new app.Player(this, this.elem.find('.player'));
  this.scoreboard = new app.shared.Scoreboard(this, this.elem.find('.board'), Constants.TOTAL_LEVELS);
  this.gameoverView = new app.shared.Gameover(this, this.elem.find('.gameover'));
  this.tutorial = new app.shared.Tutorial(this.elem, 'device-tilt', 'keys-arrows keys-space');
  this.controls = new app.Controls(this);

  // Pause animation on initial load
  this.bgElem.addClass('frozen');
  this.player.elem.addClass('frozen');

  // Cache a bound onFrame since we need it each frame.
  this.onFrame = this.onFrame.bind(this);

  this.preloadPools_();
};

/**
 * Create some skies and items at startup so we don't suffer performance penalty
 * during gameplay on android browsers.
 * @private
 */
app.Game.prototype.preloadPools_ = function() {
  // There won't ever exist more than 2 presents at same time, thanks to gravity.
  app.Present.pool(this);
  app.Present.pool(this);

  // There won't ever exist more than 2 collisions at same time.
  app.Collision.pool(this);
  app.Collision.pool(this);

  // We shouldn't need more than 12 items during gameplay.
  for (var i = 0; i < 5; i++) {
    app.Item.pool(this);
  }

  // Or 12 obstacles during gameplay.
  for (i = 0; i < 12; i++) {
    app.Obstacle.pool(this);
  }

  // Or 20 building during gameplay.
  for (i = 0; i < 20; i++) {
    app.Building.pool(this);
  }

  // Or 20 clouds during gameplay.
  for (i = 0; i < 20; i++) {
    app.Cloud.pool(this);
  }
};

/**
 * Starts the game. Should only be called once.
 * @export
 */
app.Game.prototype.start = function() {
  this.restart();
  this.tutorial.start();
};

/**
 * Restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  var self = this;

  // Cleanup last game
  this.root.children.forEach(function(e) { e.remove(); });
  this.root.children = [];

  // Reset the sky/mountain/trees animations
  this.bgElem.removeClass('frozen');
  this.player.elem.removeClass('frozen');
  this.bgElem.find('.sky').remove();
  this.bgElem.find('.mountains').remove();
  this.bgElem.find('.trees').remove();
  this.bgElem.prepend(
    '<div class="sky"></div>' +
    '<div class="mountains"></div>' +
    '<div class="trees"></div>'
  );

  // Reset game state
  this.level = 0;
  this.nextLevel = Constants.LEVEL_DURATION;
  this.buildingSpeed = Constants.BUILDING_START_SPEED;
  this.paused = false;
  this.nextItem = 0;
  this.nextObstacle = 0;
  this.nextCloud = 0;
  this.nextBuilding = 0;

  this.scoreboard.reset();
  this.player.reset();

  window.santaApp.fire('sound-ambient', 'glider_start');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'glider'});

  // Start game
  this.unfreezeGame();
};

/**
 * Runs every frame. Calculates a delta and allows each game entity to update itself.
 */
app.Game.prototype.onFrame = function() {
  if (!this.isPlaying) {
    return;
  }

  var now = +new Date() / 1000,
      delta = now - this.lastFrame;
  this.lastFrame = now;

  this.controls.onFrame(delta);
  this.player.onFrame(delta);
  this.scoreboard.onFrame(delta);
  this.updateItems_(delta);
  this.updateObstacles_(delta);
  this.updateBuildings_(delta);
  this.updateClouds_(delta);
  this.updateLevel_(delta);

  // Update entities
  var deadEntities = [];
  this.root.walk(function(entity) {
    entity.onFrame(delta);

    if (entity.dead) {
       deadEntities.push(entity);
    }
  });

  // Delete dead entities
  for (var i = 0, entity; entity = deadEntities[i]; i++) {
    entity.parent.removeChild(entity);
  }

  // Request next frame.
  this.requestId = utils.requestAnimFrame(this.onFrame);
};

/**
 * Scale the game down for smaller resolutions.
 * @param {Number} scale A scale between 0 and 1 on how much to scale.
 */
app.Game.prototype.setScale = function(scale) {
  var em = Constants.BASE_FONT_SIZE * scale;

  this.scale = scale;
  this.pixelMultiplier = 1 / em;
  this.elem.css('font-size', em + 'px');

  app.utils.restartAnimation();
};

/**
 * Spawns a new item at regular interval.
 * @param {number} delta Seconds since last frame.
 * @private
 */
app.Game.prototype.updateItems_ = function(delta) {
  this.nextItem -= delta;
  if (this.nextItem > 0) {
    return;
  }

  // Create item
  var item = app.Item.pop(this);
  this.root.addChild(item);

  // Schedule next item.
  var interval = Constants.ITEM_SPAWN_INTERVAL * Math.pow(Constants.ITEM_SPAWN_MULTIPLY_EACH_LEVEL, this.level),
      variance = Constants.ITEM_SPAWN_VARIANCE * Math.pow(Constants.ITEM_SPAWN_MULTIPLY_EACH_LEVEL, this.level);
  this.nextItem = (interval - variance / 2) + Math.random() * variance;
};

/**
 * Called by player to create a present at the player's position.
 * @param {x} x coordinate of the present.
 * @param {y} y coordinate of the present.
 */
app.Game.prototype.createPresent = function(x, y) {
  var present = app.Present.pop(this, x, y);
  this.root.addChild(present);
};

/**
 * Called by player to create a collision at the player's position.
 * @param {x} x coordinate of the collision.
 * @param {y} y coordinate of the collision.
 */
app.Game.prototype.createCollision = function(x, y) {
  var collision = app.Collision.pop(this, this.player.screenX, this.player.screenY);
  this.root.addChild(collision);
};

/**
 * Spawns a new obstacle at regular interval.
 * @param {number} delta Seconds since last frame.
 * @private
 */
app.Game.prototype.updateObstacles_ = function(delta) {
  this.nextObstacle -= delta;
  if (this.nextObstacle > 0) {
    return;
  }

  // Create item
  var obstacle = app.Obstacle.pop(this);
  this.root.addChild(obstacle);

  // Schedule next item.
  var interval = Constants.OBSTACLE_SPAWN_INTERVAL * Math.pow(Constants.OBSTACLE_SPAWN_MULTIPLY_EACH_LEVEL, this.level),
      variance = Constants.OBSTACLE_SPAWN_VARIANCE * Math.pow(Constants.OBSTACLE_SPAWN_MULTIPLY_EACH_LEVEL, this.level);
  this.nextObstacle = (interval - variance / 2) + Math.random() * variance;
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
  this.root.addChild(cloud);

  // Schedule next item.
  var interval = Constants.CLOUD_SPAWN_INTERVAL,
      variance = Constants.CLOUD_SPAWN_VARIANCE;
  this.nextCloud = (interval - variance / 2) + Math.random() * variance;
};

/**
 * Called each frame. Creates new buildings on a set interval.
 * @param {number} delta Seconds since last update.
 * @private
 */
app.Game.prototype.updateBuildings_ = function(delta) {
  this.nextBuilding -= delta;
  if (this.nextBuilding > 0) {
    return;
  }

  // Create building
  var building = app.Building.pop(this);
  this.root.addChild(building);

  // Schedule next building.
  var multiply = Math.pow(Constants.BUILDING_SPAWN_MULTIPLY_EACH_LEVEL, this.level),
      interval = Constants.BUILDING_SPAWN_BASE + Constants.BUILDING_SPAWN_INTERVAL * multiply,
      variance = Constants.BUILDING_SPAWN_VARIANCE * multiply;
  this.nextBuilding = interval;
  //this.nextBuilding = (interval - variance / 2) + Math.random() * variance;
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
  this.scoreboard.setLevel(this.level);
  this.buildingSpeed += Constants.BUILDING_SPEED_PER_LEVEL;
  window.santaApp.fire('sound-trigger', 'glider_level_up');

  // Schedule next level.
  this.nextLevel = Constants.LEVEL_DURATION;

};

/**
 * Iterates over all collidable entities and calls a callback with it.
 * @param {function(Item)} callback A function which processes each collidable.
 */
app.Game.prototype.forEachCollidable = function(callback) {
  this.root.walk(function(entity) {
    if ((entity instanceof app.Item && !entity.isHit) || entity instanceof app.Obstacle || entity instanceof app.Building) {
      callback(entity);
    }
  });
};

/**
 * Iterates over all collidable chimneys and calls a callback with it.
 * @param {function(Chimney)} callback A function which processes each collidable.
 */
app.Game.prototype.forEachActiveChimney = function(callback) {
  this.root.walk(function(entity) {
    if (entity instanceof app.Chimney && !entity.isHit) {
      callback(entity);
    }
  });
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
    this.elem.removeClass('frozen');

    // Restart the onFrame loop
    this.lastFrame = +new Date() / 1000;
    this.requestId = utils.requestAnimFrame(this.onFrame);
  }
};

/**
 * Stops the game as game over. Displays the game over screen as well.
 */
app.Game.prototype.gameover = function() {
  this.freezeGame();
  this.gameoverView.show();
  window.santaApp.fire('sound-trigger', 'glider_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'glider',
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
      sceneElem = this.sceneElem,
      bgElem = this.bgElem,
      game = this,
      mobile = this.isMobile;

  var updateSize = function() {
    var width = bgElem.width(), scale;
    if (width < 980) {
      if (mobile) {
        scale = width / 980 * 0.75;
      } else {
        scale = width / 980;
      }
    } else if (width > 1200) {
      if (mobile) {
        scale = 1;
      } else {
        scale = width / 1200;
        if (scale > Constants.MAX_SCALE) {
          scale = Constants.MAX_SCALE;
        }
      }
    } else {
      scale = 1;
    }

    game.setScale(scale);

    // in em
    size.height = game.px2em(bgElem.height());
    size.width = game.px2em(bgElem.width());
  };

  updateSize();
  $(window).on('resize.glider', updateSize);
};

/**
 * Converts a pixel coordinate to game-em coordinate.
 * @param {number} px coordinate.
 * @return {number} returns em
 */
app.Game.prototype.px2em = function(px) {
  return px * this.pixelMultiplier;
};

/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'glider',
      timePlayed: new Date - this.gameStartTime
    });
  }
  this.freezeGame();

  utils.cancelAnimFrame(this.requestId);
  $(window).off('.glider');
  $(document).off('.glider');
  this.elem.off('.glider');

  this.tutorial.dispose();
  app.Cloud.pool_ = [];
  app.Item.pool_ = [];
  app.Obstacle.pool_ = [];
  app.Building.pool_ = [];
};

