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

goog.require('app.Face');
goog.require('app.Cloth');
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
  this.elem = $(elem);
  this.gameStartTime = null;
  this.sceneElem = this.elem.find('.scene');

  var clothCanvas = this.sceneElem.find('#beard')[0];

  this.mouse = new app.Mouse(this.sceneElem);
  this.cloth = new app.Cloth(this, clothCanvas);
  this.face = new app.Face(this, this.sceneElem);

  // Construct app.Tools last, as it needs mouse/cloth/face.
  this.tools = new app.Tools(this, this.sceneElem);

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
  this.cloth.start();
  this.face.start();

  this.mouse.subscribe(this.tools.mouseChanged, this.tools);
  this.mouse.subscribe(this.cloth.mouseChanged, this.cloth);
  this.mouse.subscribe(this.face.mouseChanged, this.face);

  this.elem.find('#share-button, #share-button-toolbox').
    on('click.santaselfie touchend.santaselfie', this.showShareOverlay.bind(this));

  this.elem.find('#reset-button, #reset-button-toolbox').
    on('click.santaselfie touchend.santaselfie', this.resetBeard_.bind(this));

  this.restart();

  var beard = getUrlParameter('beard');
  beard && this.cloth.restore(beard);
};


/**
 * Resets the beard to original state.
 * @private
 */
app.Game.prototype.resetBeard_ = function() {
  this.cloth.resetCloth();
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
    this.cloth.update();
    this.accumulator -= app.Constants.TIME_STEP;
  }
};


/**
 * Show share overlay.
 */
app.Game.prototype.showShareOverlay = function() {
  var s = this.cloth.save();

  var url = new URL(window.location.toString());
  url.search = '?beard=' + window.encodeURIComponent(s);
  var urlString = url.toString();

  // TODO(samthor): Set this as the beard changes over time.
  window.history.replaceState(null, '', urlString);

  this.shareOverlay.show(urlString, true);
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
    this.requestId = window.requestAnimationFrame(this.onFrame_);
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
  this.cloth.draw();

  // Request next frame
  this.requestId = window.requestAnimationFrame(this.onFrame_);
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
 * Dispose the game.
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    var opts = {
      gameid: 'santaselfie',
      timePlayed: new Date - this.gameStartTime,
      level: 1
    };
    window.santaApp.fire('analytics-track-game-quit', opts);
  }
  this.freezeGame();

  window.cancelAnimationFrame(this.requestId);
  $(window).off('.santaselfie');
  $(document).off('.santaselfie');
};
