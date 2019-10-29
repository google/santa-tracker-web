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

goog.require('Klang');
goog.require('app.Blockly');
goog.require('app.Constants');
goog.require('app.Result');
goog.require('app.Scene');
goog.require('app.levels');
goog.require('app.monkeypatches');
goog.require('app.shared.utils');

/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
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

  this.dismissUnnamedTutorial = () => this.dismissTutorial();
  document.body.addEventListener('blocklyDragBlock', this.dismissUnnamedTutorial, false);

  this.onBlur = this.onBlur.bind(this);
  this.onFocus = this.onFocus.bind(this);
  window.addEventListener('blur', this.onBlur);
  window.addEventListener('focus', this.onFocus);
};

/**
 * @param {number} levelNumber
 * @return {string}
 */
app.Game.prototype.tutorialForLevel_ = function(levelNumber) {
  return 'codelab_' + (levelNumber >= 2 ? 'maze' : 'puzzle') + '.mp4';
};

/**
 * @param {string=} name
 */
app.Game.prototype.dismissTutorial = function(name = undefined) {
  if (name === undefined) {
    name = this.tutorialForLevel_(this.levelNumber);
  }
  window.santaApp.fire('tutorial-dismiss', [name]);
};

/**
 * Clean up game instance.
 * @private
 */
app.Game.prototype.dispose_ = function() {
  document.body.removeEventListener('blocklyDragBlock', this.dismissUnnamedTutorial, false);
  window.removeEventListener('blur', this.onBlur);
  window.removeEventListener('focus', this.onFocus);

  window.cancelAnimationFrame(this.frameId);
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
    window.santaApp.fire('game-stop', {
      level: this.levelNumber + 1,
    });
    return;
  }

  window.santaApp.fire('game-score', {
    level: this.levelNumber + 1,
    maxLevel: app.levels.length,
  });

  this.elem.className = 'level--' + this.level.type + ' level--' + this.level.id;

  this.blockly.setLevel(this.level);

  var isMaze = this.level.type === 'maze';
  if (isMaze) {
    this.scene.setLevel(this.level);
  }
  this.scene.toggleVisibility(isMaze);

  // Show tutorial
  const tutorials = [this.tutorialForLevel_(this.levelNumber)];
  if (this.levelNumber === 2 && this.scene.getPortraitMode()) {
    // This isn't perfect because transitions back from mobile mode will retain the tray, but it's
    // fine for now.
    tutorials.unshift('codelab_tray.mp4');
  }
  window.santaApp.fire('tutorial-queue', tutorials);
};

app.Game.prototype.onBlur = function() {
  // this.iframeChannel.call('iframeFocusChange', 'blur');
};

app.Game.prototype.onFocus = function() {
  // this.iframeChannel.call('iframeFocusChange', 'focus');
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
app.Game.prototype.start = function(level=1) {
  this.restart(level);

  Klang.triggerEvent('computer_start');
};

/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function(level=1) {
  this.levelNumber = level - 2;  // gets bumped to zero

  this.scene.reset();

  this.bumpLevel();
};
