/*
 * Copyright 2017 Google Inc. All rights reserved.
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

goog.require('app.Canvas');
goog.require('app.Colorpicker');
goog.require('app.Mouse');
goog.require('app.Rotator');
goog.require('app.Slider');
goog.require('app.Tools');



/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = function(elem, importPath) {
  this.elem = $(elem);
  this.importPath = importPath;
  this.sceneElem = this.elem.find('.scene');
  this.rotateElem = this.elem.find('.force-rotate');

  this.mouse = new app.Mouse(this.sceneElem);
  this.canvas = new app.Canvas(this, this.sceneElem);

  // Construct app.Tools last, as it needs mouse/canvas.
  this.tools = new app.Tools(this, this.sceneElem);
  this.slider = new app.Slider(this.elem, this.mouse);
  this.colorpicker = new app.Colorpicker(this.elem);
  this.rotator = new app.Rotator(this.elem);

  this.onFrame_ = this.onFrame_.bind(this);

  this.isIE = navigator.userAgent.indexOf('MSIE') !== -1 ||
    navigator.appVersion.indexOf('Trident/') > 0;

  if (this.isIE) {
    this.sceneElem.find('[data-tool-save]').addClass('u-hidden');
  }
};


/**
 * Start the game
 * @export
 */
app.Game.prototype.start = function() {
  this.tools.start();
  this.canvas.start();

  this.mouse.subscribe(this.tools.mouseChanged, this.tools);
  this.mouse.subscribe(this.canvas.mouseChanged, this.canvas);
  this.mouse.subscribe(this.slider.mouseChanged, this.slider);
  this.slider.subscribe(this.tools.sliderChanged, this.tools);
  this.rotator.subscribe(this.tools.rotatorChanged, this.tools);
  this.colorpicker.subscribe(this.tools.colorChanged, this.tools);

  this.elem.find('#reset-button, #reset-button-toolbox').
    on('click.santascanvas touchend.santascanvas', this.resetCanvas_.bind(this));

  this.restart();
};


/**
 * Resets the canvas to original state.
 * @private
 */
app.Game.prototype.resetCanvas_ = function() {
  this.canvas.resetCanvas();
};


/**
 * Resets all game entities and restarts the game. Can be called at any time.
 * TODO: make sure this works
 */
app.Game.prototype.restart = function() {
  this.paused = false;
  this.resetCanvas_();
  this.unfreezeGame();
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
  this.canvas.snow.update(delta);
  this.canvas.clearAnimation.update();
  this.canvas.soundUpdate()
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
    this.lastFrame = performance.now();
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
  const now = performance.now();
  const delta = Math.min(1000, now - this.lastFrame);
  this.lastFrame = now;

  // Update game state with physics simulations.
  this.update(delta);

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
  this.freezeGame();

  window.cancelAnimationFrame(this.requestId);
  $(window).off('.santascanvas');
  $(document).off('.santascanvas');
};
