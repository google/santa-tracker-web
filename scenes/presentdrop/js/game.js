goog.provide('app.Game');

goog.require('Constants');
goog.require('app.shared.utils');
goog.require('app.shared.pools');
goog.require('app.shared.Gameover');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Tutorial');
goog.require('Chimney');
goog.require('Controls');
goog.require('Levels');
goog.require('Player');
goog.require('Present');

/**
 * Main game class.
 * @param {Element} elem An DOM element which wraps the game.
 * @author aranja@aranja.com
 * @constructor
 */
function Game(elem) {
  this.elem = $(elem);

  this.player = new Player(this, this.elem.find('.player'));
  this.scoreboard = new Scoreboard(this, this.elem.find('.board'), Constants.TOTAL_LEVELS);
  this.gameoverDialog = new Gameover(this, this.elem.find('.gameover'));
  this.tutorial = new Tutorial(this.elem, 'touch-leftright', 'keys-space keys-leftright');
  this.controls = new Controls(this);
  this.levels = new Levels(this);
  this.entities = [];
  this.isPlaying = false;
  this.paused = false;
  this.hidden = false;
  this.scale = 1;
  this.chimneysElem = this.elem.find('.chimneys');
  this.presentsElem = this.elem.find('.presents');
  this.gameStartTime = +new Date;

  // Cache a bound onFrame since we need it each frame.
  this.onFrame = this.onFrame.bind(this);

  this.watchSceneSize_();
  this.preloadPools_();
}

/**
 * Create some chimneys and presents at startup so we don't suffer performance penalty
 * during gameplay on android browsers.
 * @private
 */
Game.prototype.preloadPools_ = function() {
  // We shouldn't need more than 7 chimneys during gameplay.
  for (var i = 0; i < 7; i++) {
    Chimney.pool(this);
  }

  // There won't ever exist more than 2 presents at same time, thanks to gravity.
  Present.pool(this);
  Present.pool(this);
};

/**
 * Starts the game.
 * @export
 */
Game.prototype.start = function() {
  this.restart();
  this.tutorial.start();
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
  this.scoreboard.reset();
  this.scoreboard.setLevel(this.level);

  this.chimneySpeed = Constants.CHIMNEY_START_SPEED;
  this.nextChimney = 0;

  this.player.reset();
  this.levels.reset();
  this.paused = false;

  // Start game
  window.santaApp.fire('sound-trigger', 'pd_start_game');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'presentdrop'});
  this.unfreezeGame();
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

  // Update static entities
  this.player.onFrame(delta);
  this.levels.onFrame(delta);
  this.scoreboard.onFrame(delta);
  this.updateChimneys(delta);

  // Update entities and track which are dead.
  var deadEntities = [];
  for (var i = 0, entity; entity = this.entities[i]; i++) {
    entity.onFrame(delta);

    if (entity.dead) {
      deadEntities.push(i);
    }
  }

  // Cleanup dead entities
  for (var i = 0, deadEntity; (deadEntity = deadEntities[i]) != null; i++) {
    this.entities.splice(deadEntity - i, 1);
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
  var view = this.elem.find('.view'),
      bg = this.elem.find('.bg');
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
 */
Game.prototype.updateChimneys = function(delta) {
  this.nextChimney -= delta;
  if (this.nextChimney > 0) {
    return;
  }

  // Create chimney
  var chimney = Chimney.pop(this);
  this.entities.push(chimney);

  // Schedule next chimney.
  var multiply =
        Math.pow(Constants.CHIMNEY_SPAWN_MULTIPLY_EACH_LEVEL, this.level),
      interval = Constants.CHIMNEY_SPAWN_BASE + Constants.CHIMNEY_SPAWN_INTERVAL * multiply,
      variance = Constants.CHIMNEY_SPAWN_VARIANCE * multiply;
  this.nextChimney = (interval - variance / 2) + Math.random() * variance;
};

/**
 * Called by player to create a present at the specified x position.
 * @param {number} x The position which the present should be created at.
 */
Game.prototype.createPresent = function(x) {
  var present = Present.pop(this, x);
  this.entities.push(present);
};

/**
 * Called by a chimney when it is hit to record its score.
 * @param {number} score The score gained.
 */
Game.prototype.hitChimney = function(score) {
  this.scoreboard.addScore(score);
  this.scoreboard.addTime(1);
  window.santaApp.fire('sound-trigger', 'pd_player_present_pickup');
};

/**
 * Iterates all chimneys that have not been hit. Used for collision detection.
 * @param {function(Chimney): void} fun The function to run for each chimney.
 */
Game.prototype.forEachActiveChimney = function(fun) {
  for (var i = 0, chimney; chimney = this.entities[i]; i++) {
    if (chimney instanceof Chimney && !chimney.isHit) {
      fun(chimney);
    }
  }
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
 * Called by levels to bump the level.
 */
Game.prototype.nextLevel = function() {
  if (this.level === Constants.TOTAL_LEVELS - 1) {
    this.gameover();
    return;
  }

  this.level++;
  this.scoreboard.setLevel(this.level);
  this.chimneySpeed += Constants.CHIMNEY_SPEED_PER_LEVEL;
  window.santaApp.fire('sound-trigger', 'pd_player_level_up');
};

/**
 * Called by the scoreboard to stop the game when the time is up.
 */
Game.prototype.gameover = function() {
  this.freezeGame();
  this.gameoverDialog.show();
  window.santaApp.fire('sound-trigger', 'pd_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'presentdrop',
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
  var win = $(window),
      game = this;

  var updateSize = function() {
    var width = win.width(),
      height = win.height(),
      scale = width < 890 ? width / 890 : 1;
    scale = height < 660 ? Math.min(height / 640, scale) : scale;
    game.setScale(scale);
  };

  updateSize();
  $(window).on('resize.presentdrop', updateSize);
};

/**
 * Cleanup
 * @export
 */
Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {
      gameid: 'presentdrop',
      timePlayed: new Date - this.gameStartTime,
      level: this.level
    });
  }
  this.freezeGame();

  utils.cancelAnimFrame(this.requestId);
  $(window).off('.presentdrop');
  $(document).off('.presentdrop');
  this.elem.off('.presentdrop');

  this.tutorial.dispose();
  Chimney.pool_ = [];
  Present.pool_ = [];
};

/**
 * Export game object.
 * @type {Game}
 * @export
 */
app.Game = Game;
