goog.provide('Game');
goog.provide('app.Game');

goog.require('Boat');
goog.require('Bubble');
goog.require('Constants');
goog.require('Controls');
goog.require('Iceberg');
goog.require('Player');
goog.require('Present');
goog.require('app.shared.Coordinator');
goog.require('app.shared.Effect');
goog.require('app.shared.Gameover');
goog.require('app.shared.LevelUp');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Tutorial');
goog.require('app.shared.pools');
goog.require('app.shared.utils');

/**
 * Main game class.
 * @param {Element} elem An DOM element which wraps the game.
 * @constructor
 */
Game = function(elem) {
  this.elem = $(elem);

  this.viewElem = this.elem.find('.view');
  this.boatsElem = this.elem.find('.boats');
  this.icebergsElem = this.elem.find('.icebergs');
  this.presentsElem = this.elem.find('.presents');
  this.bubblesElem = this.elem.find('.bubbles');
  this.bgElem = this.elem.find('.bg');

  this.entities = [];
  this.isPlaying = false;
  this.paused = true;
  this.level = 1;
  this.hidden = false;
  this.scale = 1;
  this.sceneSize = { height: 0, width: 0 };

  this.watchSceneSize_();

  this.player = new Player(this, this.elem.find('.player'));
  this.scoreboard = new Scoreboard(this, this.elem.find('.board'));
  this.gameoverDialog = new Gameover(this, this.elem.find('.gameover'));
  this.tutorial = new Tutorial(this.elem, 'touch-updown', 'keys-space keys-updown');
  this.controls = new Controls(this);
  this.levelUp = new LevelUp(this, this.elem.find('.levelup'), this.elem.find('.levelup--number'));
  this.score = new Effect(this, this.elem.find('.score-sign'));
  this.splash = new Effect(this, this.elem.find('.splash'));
  this.gameStartTime = +new Date;

  // Cache a bound onFrame since we need it each frame.
  this.onFrame = this.onFrame.bind(this);

  this.preloadPools_();
  this.reuseBubbles_();
}

/**
 * Create some boats and presents at startup so we don't suffer performance penalty
 * during gameplay on android browsers.
 * @private
 */
Game.prototype.preloadPools_ = function() {
  // Prepare 5 boats.
  for (var i = 0; i < 5; i++) {
    Boat.pool(this);
  }

  // Prepare 7 icebergs and presents.
  for (i = 0; i < 7; i++) {
    Iceberg.pool(this);
    Present.pool(this);
  }

  // Prepare 30 bubbles.
  for (i = 0; i < 30; i++) {
    Bubble.pool(this);
  }
};

/**
 * Start the game
 */
Game.prototype.start = function() {
  this.tutorial.start();
  this.restart();
};

/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
Game.prototype.restart = function() {
  // Cleanup last game
  this.entities.forEach(function(e) { e.remove(); });
  this.entities = [];

  // Reset game state
  var match = location.search.match(/[?&]level=(\d+)/) || [];
  this.level = (+match[1] || 1) - 1;
  this.nextLevel = Constants.LEVEL_DURATION;
  this.scoreboard.reset();
  this.scoreboard.setLevel(this.level);

  this.boatSpeed = Constants.BOAT_START_SPEED;
  this.nextBoat = 0;
  this.nextBoatType = null;
  this.lastBoat = null;
  this.icebergSpeed = Constants.ICEBERG_START_SPEED;
  this.nextIceberg = 0;

  this.lastMissedPresent && this.lastMissedPresent.remove();
  this.lastMissedPresent = null;

  Coordinator.reset();
  this.paused = false;
  this.player.reset();

  // Start game
  this.unfreezeGame();
  window.santaApp.fire('sound-trigger', 'bl_game_start');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'boatload'});
  this.gameStartTime = +new Date;
};

/**
 * Called each frame while game is running. Calls onFrame on all entities.
 */
Game.prototype.onFrame = function() {
  if (!this.isPlaying) {
    return;
  }

  // Calculate delta
  var now = +new Date() / 1000,
    delta = now - this.lastFrame;
  this.lastFrame = now;

  Coordinator.onFrame(delta);

  // Update static entities
  this.player.onFrame(delta);
  this.updateLevel_(delta);
  this.scoreboard.onFrame(delta);
  this.updateBoats(delta);
  this.updateIcebergs(delta);

  // Update entities and track which are dead.
  var deadEntities = [];
  for (var i = 0, entity; entity = this.entities[i]; i++) {
    entity.onFrame(delta);

    if (entity.dead) {
      deadEntities.push(i);
    }
  }

  // Cleanup dead entities
  for (var x = 0, deadEntity; (deadEntity = deadEntities[x]) != null; x++) {
    this.entities.splice(deadEntity - x, 1);
  }

  // Request next frame
  this.requestId = utils.requestAnimFrame(this.onFrame);
};

/**
 * Scale the game down for smaller resolutions.
 * @param {Number} scale A scale between 0 and 1 on how much to scale.
 */
Game.prototype.setScale = function(scale) {
  this.scale = scale;
  this.bgElem.css('transform', 'scaleX(' + scale + ')');
  this.viewElem.css('transform', 'scale(' + scale + ')')
      .css('height', (this.sceneSize.height) + 'px');
  if (this.player) {
    this.player.reset();
  }
};

/**
 * Called each frame. Creates new boats on a set interval.
 * @param {number} delta Seconds since last update.
 */
Game.prototype.updateBoats = function(delta) {
  this.nextBoat -= delta;
  if (this.nextBoat > 0) {
    return;
  }

  if (!this.nextBoatType) {
    // Find a random type for the boat
    var typeNumber = Math.ceil(Math.random() * Constants.BOATS.length);
    this.nextBoatType = Constants.BOATS[typeNumber - 1];
  }

  // Avoid boat collition
  if (this.lastBoat) {
    var lastTime = (this.lastBoat.y + this.lastBoat.height) /
        (this.lastBoat.speed * this.boatSpeed);
    var typeTime = this.sceneSize.height / (this.nextBoatType.speed * this.boatSpeed);
    if (lastTime > typeTime) {
      this.nextBoat = lastTime - typeTime;
      return;
    }
  }

  // Create the boat
  var boat = Boat.pop(this, this.nextBoatType);
  this.entities.push(boat);
  this.lastBoat = boat;
  this.nextBoatType = null;

  // Schedule next boat.
  var multiply = Math.pow(Constants.BOAT_SPAWN_MULTIPLY_EACH_LEVEL, this.level),
      interval = Constants.BOAT_SPAWN_BASE + Constants.BOAT_SPAWN_INTERVAL * multiply,
      variance = Constants.BOAT_SPAWN_VARIANCE * multiply;
  this.nextBoat = (interval - variance / 2) + Math.random() * variance;

  // Make sure there is always one boat on the screen
  if (this.lastBoat) {
    var lastTime = (this.lastBoat.y + this.lastBoat.height) /
        (this.lastBoat.speed * this.boatSpeed);
    this.nextBoat = Math.min(lastTime, this.nextBoat);
  }
};

/**
 * Called each frame. Creates new icebergs on a set interval.
 * @param {number} delta Seconds since last update.
 */
Game.prototype.updateIcebergs = function(delta) {
  this.nextIceberg -= delta;
  if (this.nextIceberg > 0) {
    return;
  }

  // Get a random type for the iceberg
  var typeNumber = Math.ceil(Math.random() * Constants.ICEBERGS.length);
  var type = Constants.ICEBERGS[typeNumber - 1];

  // Find random X position
  var x = Constants.ICEBERG_X +
      (Math.random() * Constants.ICEBERG_X_VARIANCE) -
      (Constants.ICEBERG_X_VARIANCE / 2);
  var timeleft = (this.sceneSize.height - type.height) / type.speed;

  // Check if that X position will collide with another iceberg
  for (var i = 0; i < this.entities.length; i++) {
    if (!(this.entities[i] instanceof Iceberg)) {
      continue;
    }

    if (timeleft < (this.sceneSize.height + this.entities[i].height -
        this.entities[i].y) / this.entities[i].speed) {
      this.nextIceberg = 1;
      return;
    }
  }

  // Create iceberg
  var iceberg = Iceberg.pop(this, type, x);
  this.entities.push(iceberg);

  // Schedule next iceberg.
  var multiply =
        Math.pow(Constants.ICEBERG_SPAWN_MULTIPLY_EACH_LEVEL, this.level),
      interval = Constants.ICEBERG_SPAWN_BASE + Constants.ICEBERG_SPAWN_INTERVAL * multiply,
      variance = Constants.ICEBERG_SPAWN_VARIANCE * multiply;
  this.nextIceberg = (interval - variance / 2) + Math.random() * variance;
};

/**
 * Updates the current level on each frame.
 * @param {number} delta Seconds since last frame.
 * @private
 */
Game.prototype.updateLevel_ = function(delta) {
  this.nextLevel -= delta;
  if (this.nextLevel > 0) {
    return;
  }

  // Check for game end
  if (this.level === Constants.TOTAL_LEVELS - 1) {
    this.gameover();
    return;
  }

  // Next level
  this.level++;
  this.scoreboard.setLevel(this.level);
  this.boatSpeed += Constants.BOAT_SPEED_PER_LEVEL;
  this.icebergSpeed += Constants.ICEBERG_SPEED_PER_LEVEL;

  // Schedule next level.
  this.nextLevel = Constants.LEVEL_DURATION;
};


/**
 * Called by player to create a present at the specified x position.
 * @param {Present} present The present to drop.
 */
Game.prototype.dropPresent = function(present) {
  this.entities.push(present);
  window.santaApp.fire('sound-trigger', 'bl_shoot');
};

/**
 * Called by a boat when it is hit to record its score.
 * @param {number} score The score gained.
 * @param {number} time The time gained.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 */
Game.prototype.hitBoat = function(score, time, x, y) {
  this.score.elem.text(score);
  this.score.animate(x, y);
  this.scoreboard.addScore(score);
  this.scoreboard.addTime(time);
};

/**
 * Boat missed.
 * @param {Present} present The present
 * @param {number} x The X position.
 * @param {number} y The Y position.
 */
Game.prototype.missedBoat = function(present, x, y) {
  this.splash.animate(x, y);
  this.lastMissedPresent = present;
  present.missed();
  window.santaApp.fire('sound-trigger', 'bl_hit_water');
};

/**
 * Stops the onFrame loop and stops all relevant CSS3 animations.
 * Used by pause and gameover.
 */
Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.elem.addClass('frozen');
};

/**
 * Starts the onFrame loop and enables CSS3 animations.
 * Used by unpause and restart.
 */
Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.elem.removeClass('frozen').focus();

    this.isPlaying = true;
    this.lastFrame = +new Date() / 1000;
    this.requestId = utils.requestAnimFrame(this.onFrame);
  }
};

/**
 * Called by the scoreboard to stop the game when the time is up.
 */
Game.prototype.gameover = function() {
  this.freezeGame();
  this.gameoverDialog.show();
  window.santaApp.fire('sound-trigger', 'bl_game_stop');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'boatload',
    score: this.scoreboard.score,
    level: this.level,
    timePlayed: new Date - this.gameStartTime
  });
};

/**
 * Pauses/unpauses the game.
 */
Game.prototype.togglePause = function() {
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
Game.prototype.pause = function() {
  this.paused = true;
  this.freezeGame();
};

/**
 * Resume the game.
 */
Game.prototype.resume = function() {
  this.paused = false;
  this.unfreezeGame();
};

/**
 * Detects scene size and manages scale. Updates on window resize.
 * @private
 */
Game.prototype.watchSceneSize_ = function() {
  var size = this.sceneSize,
      bgElem = this.bgElem,
      game = this;

  var updateSize = function() {
    var width = window.innerWidth,
      height = window.innerHeight,
      scale = width < 980 ? width / 980 : 1;
    scale = height < 600 ?
        Math.min(height / 600, scale) :
        scale;

    size.height = window.innerHeight * (1 / scale);
    size.width = window.innerWidth * (1 / scale);
    game.setScale(scale);
  };

  updateSize();
  $(window).on('resize.boatload', updateSize)
      .on('orientationchange.boatload', updateSize);
};

/**
 * Reuse bubbles.
 * @private
 */
Game.prototype.reuseBubbles_ = function() {
  this.bubblesElem.on(utils.TRANSITION_END, function(event) {
    Bubble.push(event.target.bubble);
  });
};

/**
 * Cleanup
 */
Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit',
                         {gameid: 'boatload', timePlayed: new Date - this.gameStartTime});
  }
  this.freezeGame();

  utils.cancelAnimFrame(this.requestId);
  $(window).off('.boatload');
  $(document).off('.boatload');
  this.elem.off('.boatload');

  pools.empty();
  this.tutorial.dispose();
  Coordinator.waiting = [];
};

/**
 * Export game class.
 * @type {Game}
 * @export
 */
app.Game = Game;
