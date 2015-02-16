goog.provide('app.Game');

// Singleton instance.
var game;

goog.require('app.Face');
goog.require('app.Hair');
goog.require('app.Mouse');
goog.require('app.Tools');
goog.require('app.shared.ShareOverlay');



/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  game = this;

  this.elem = $(elem);
  this.gameStartTime = null;
  this.sceneElem = this.elem.find('.scene');

  this.mouse = new app.Mouse(this.sceneElem);
  this.tools = new app.Tools(this.sceneElem);
  this.hair = new app.Hair(this.sceneElem);
  this.face = new app.Face(this.sceneElem);

  this.shareOverlay = new app.shared.ShareOverlay(this.elem.find('.shareOverlay'));

  this.onFrame_ = this.onFrame_.bind(this);
  this.accumulator = 0;
};


/**
 * Start the game
 * @export
 */
app.Game.prototype.start = function() {
  this.tools.start();
  this.hair.start();
  this.face.start();

  this.elem.find('#share-button, #share-button-toolbox').
    on('click.santaselfie touchend.santaselfie', this.showShareOverlay.bind(this));

  this.elem.find('#reset-button, #reset-button-toolbox').
    on('click.santaselfie touchend.santaselfie', this.resetBeard_.bind(this));

  this.restart();
};


/**
 * Resets the beard to original state.
 * @private
 */
app.Game.prototype.resetBeard_ = function() {
  this.hair.cloth.resetCloth();
};


/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  this.paused = false;
  this.unfreezeGame();

  window.santaApp.fire('analytics-track-game-start', {gameid: 'santaselfie'});
  this.gameStartTime = +new Date;
};


/**
 * Updates game state since last frame.
 * @param {number} delta Time elapsed since last update in milliseconds
 */
app.Game.prototype.update = function(delta) {
  if (!this.isPlaying) {
    return;
  }

  this.mouse.update();

  this.accumulator += delta;

  while (this.accumulator > app.Constants.TIME_STEP) {
    this.hair.update();
    this.accumulator -= app.Constants.TIME_STEP;
  }
};


/**
 * Show share overlay.
 */
app.Game.prototype.showShareOverlay = function() {
  var s = this.hair.save();

  var newHref = location.href.substr(0,
      location.href.length - location.hash.length) + '#santaselfie?beard=' + s;
  window.history.pushState(null, '', newHref);

  this.shareOverlay.show('https://santatracker.google.com/#santaselfie?beard=' + s, true);
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
    this.elem.removeClass('frozen');

    this.isPlaying = true;
    this.lastFrame = +new Date();
    this.requestId = utils.requestAnimFrame(this.onFrame_);
  }
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
  var now = +new Date();
  var delta = Math.min(1000, now - this.lastFrame);
  this.lastFrame = now;

  // Update game state with physics simulations.
  this.update(delta);
  this.hair.draw();

  // Request next frame
  this.requestId = utils.requestAnimFrame(this.onFrame_);
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
 * Restore a beard from string.
 * @param {string} beard serialized in string.
 */
app.Game.prototype.restoreBeard = function(beard) {
  this.hair.restore(beard);
};


/**
 * Dispose the game.
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit',
                         {gameid: 'santaselfie', timePlayed: new Date - this.gameStartTime,
                          level: 1});
  }
  this.freezeGame();

  utils.cancelAnimFrame(this.requestId);
  $(window).off('.santaselfie');
  $(document).off('.santaselfie');

  game = null;
};
