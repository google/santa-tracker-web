goog.provide('app.Game');

goog.require('app.Belt');
goog.require('app.Constants');
goog.require('app.Tutorial');
goog.require('app.shared.Gameover');
goog.require('app.shared.LevelUp');
goog.require('app.shared.PauseOverlay');
goog.require('app.shared.Scoreboard');

/**
 * Main game class
 * @param {Element} elem A DOM element which wraps the game.
 * @author aranja@aranja.com
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.debug = location.href.indexOf('debug') >= 0;
  this.elem = $(elem);
  this.scene = this.elem.find('.scene');
  this.gui = this.elem.find('.gui');

  this.scoreboard = new app.shared.Scoreboard(this, this.elem.find('.board'));
  this.gameoverView = new app.shared.Gameover(this, this.elem.find('.gameover'));
  this.levelUp = new app.shared.LevelUp(this,
      this.elem.find('.levelup'), this.elem.find('.levelup--number'));
  this.pauseOverlay = new app.shared.PauseOverlay(this.elem.find('.pauseOverlay'));
  this.tutorial = new app.Tutorial(this.elem);

  this.isPlaying = false;
  this.paused = false;
  this.hidden = false;

  this.gameStartTime = +new Date;

  // Cache a bound onFrame since we need it each frame.
  this.onFrame = this.onFrame.bind(this);
  this.bumpLevel_ = this.bumpLevel_.bind(this);

  this.belt = new app.Belt(this.elem,
    this.onFinishLevel_.bind(this),
    this.scoreboard.addScore.bind(this.scoreboard),
    this.onMissPresent_.bind(this),
    this.onMatchPresent_.bind(this)
  );
};


/**
 * Starts the game.
 * @export
 */
app.Game.prototype.start = function() {
  this.restart();
  this.tutorial.start();

  this.watchWindowSize_();
};

/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  // TODO: Cleanup last game
  if (this.paused) {
    this.pauseOverlay.hide();
  }

  this.level = 0;
  this.paused = false;

  this.scoreboard.reset();
  this.bumpLevel_();

  // Start game
  if (!this.debug) {
    window.santaApp.fire('sound-trigger', 'latlong_start');
  }
  window.santaApp.fire('analytics-track-game-start', {gameid: 'latlong'});
  this.unfreezeGame();
};


/**
 * Game loop. Runs every frame using requestAnimationFrame.
 */
app.Game.prototype.onFrame = function() {
  if (!this.isPlaying) {
    return;
  }

  // Calculate delta since last frame.
  var now = +new Date() / 1000;
  var delta = Math.min(1, now - this.lastFrame);
  this.lastFrame = now;

  this.scoreboard.onFrame(delta);
  this.belt.onFrame(delta);

  // Request next frame
  this.requestId = utils.requestAnimFrame(this.onFrame);
};


/**
 * Event handler for when a level is finished. Starts next level or triggers
 * game over.
 * @private
 */
app.Game.prototype.onFinishLevel_ = function() {
  if (this.level === Constants.LEVEL_COUNT) {
    this.gameover();
  } else {
    this.levelUp.show(this.level + 1, this.bumpLevel_);
  }
};


/**
 * Event handler when a present is missed.
 * @private
 */
app.Game.prototype.onMissPresent_ = function() {
  this.scoreboard.addTime(Constants.MISS_TIME);
};


/**
 * Event handler when a present is matched.
 * @private
 */
app.Game.prototype.onMatchPresent_ = function() {
  this.scoreboard.addTime(Constants.MATCH_TIME);
};


/**
 * Transition to the next level.
 * @private
 */
app.Game.prototype.bumpLevel_ = function() {
  // Next level
  this.level++;
  this.belt.onLevel(this.level);

  // Send Klang event
  if (this.level > 0) {
    window.santaApp.fire('sound-trigger', 'latlong_level_up');
  }

  // Update time!
  var time = app.Constants.TIME_PER_LEVEL;
  this.scoreboard.setLevel(this.level - 1);
  this.scoreboard.addTime(time);
};


/**
 * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
 * Used both for game over and pausing.
 */
app.Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.elem.addClass('frozen');
  this.belt.onPause();
};

/**
 * Unfreezes the game, starting the game loop as well.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.elem.removeClass('frozen');
    this.belt.onResume();

    this.isPlaying = true;
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
  window.santaApp.fire('sound-trigger', 'latlong_game_over');
  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'latlong',
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
  this.elem.addClass('is-paused');

  if (!this.debug) {
    this.pauseOverlay.show();
  }
};

/**
 * Resume the game.
 */
app.Game.prototype.resume = function() {
  var el = this.elem;
  this.paused = false;
  this.unfreezeGame();

  this.pauseOverlay.hide(function() {
    el.removeClass('is-paused');
  });
};


/**
 * Monitors window size and updates viewport accordingly.
 * @private
 */
app.Game.prototype.watchWindowSize_ = function() {
  $(window).on('resize.latlong orientationchange.latlong', this.belt.rescale.bind(this.belt));
};


/**
 * Cleanup
 * @export
 */
app.Game.prototype.dispose = function() {
  window.santaApp.fire('analytics-track-game-quit', {gameid: 'latlong', timePlayed: new Date - this.gameStartTime, level: this.level});

  $(window).off('.latlong');
  $(document).off('.latlong');

  this.levelUp.dispose();

  app.shared.pools.empty();
};
