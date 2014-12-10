
goog.provide('app.Game');

goog.require('Klang');
goog.require('app.Blockly');
goog.require('app.Constants');
goog.require('app.Result');
goog.require('app.Scene');
goog.require('app.levels');
goog.require('app.monkeypatches');
goog.require('app.shared.FrameRPC');
goog.require('app.shared.utils');

/**
 * Main game class
 * @param {Element} elem An DOM element which wraps the game.
 * @author aranja@aranja.com
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.blockly = new app.Blockly(elem.querySelector('.blockly'), this);
  this.elem = elem;
  this.frameId = null;
  this.levelNumber = null;
  this.level = null;
  this.isPlaying = false;
  this.successResult = new app.Result(elem.querySelector('.result--success'), this);
  this.failureResult = new app.Result(elem.querySelector('.result--failure'), this);
  this.scene = new app.Scene(elem.querySelector('.scene'), this, this.blockly);
  this.tutorial_ = new app.SceneTutorial(elem.querySelector('.tutorial'));

  this.iframeChannel = new app.shared.FrameRPC(window.parent, {
    restart: this.restart.bind(this)
  });

  Klang.setEventListener(this.iframeChannel.call.bind(this.iframeChannel, 'triggerSound'));

  window.addEventListener('blur', this.onBlur.bind(this));
  window.addEventListener('focus', this.onFocus.bind(this));

  this.start();
};

/**
 * Clean up game instance.
 * @private
 */
app.Game.prototype.dispose_ = function() {
  app.shared.utils.cancelAnimFrame(this.frameId);
  this.scene.dispose();
};

/**
 * Transition to next level.
 */
app.Game.prototype.bumpLevel = function() {
  // Next level
  this.levelNumber++;

  this.level = app.levels[this.levelNumber];
  if (!this.level) {
    this.iframeChannel.call('gameover');
    return;
  }

  this.iframeChannel.call('setLevel', this.levelNumber);

  this.elem.className = 'level--' + this.level.type + ' level--' + this.level.id;

  this.blockly.setLevel(this.level);

  var isMaze = this.level.type === 'maze';
  if (isMaze) {
    this.scene.setLevel(this.level);
  }
  this.scene.toggleVisibility(isMaze);

  // Show tutorial
  if (this.levelNumber === 0 || this.levelNumber === 2) {
    this.tutorial_.schedule();
  }
};

app.Game.prototype.onBlur = function() {
  this.iframeChannel.call('iframeFocusChange', 'blur');
};

app.Game.prototype.onFocus = function() {
  this.iframeChannel.call('iframeFocusChange', 'focus');
};

/**
 * Resets state of the current level. Only applies to maze levels currently.
 */
app.Game.prototype.restartLevel = function() {
  if (this.level.type === 'maze') {
    this.scene.restartLevel(true);
  }
};

/**
 * Starts the game.
 */
app.Game.prototype.start = function() {
  this.restart();

  Klang.triggerEvent('computer_start');
};

/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  var match = location.search.match(/[?&]level=(\d+)/) || [];
  var levelNumber = (+match[1] || 0) - 1;
  this.levelNumber = levelNumber;

  this.scene.reset();

  this.bumpLevel();
};
