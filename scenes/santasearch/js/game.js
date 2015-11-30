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
'use strict';

goog.provide('app.Game');

goog.require('app.Constants');
goog.require('app.Controls');
goog.require('app.Map');
goog.require('app.shared.Gameover');
goog.require('app.shared.utils');

/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @implements {SharedGame}
 * @constructor
 * @struct
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);
  this.mapElem = this.elem.find('.map');
  this.guiElem = this.elem.find('.gui');
  this.drawerElem = this.elem.find('.drawer');

  this.gameoverModal = new app.shared.Gameover(this,
      this.elem.find('.gameover'));

  this.gameStartTime = null;
  this.sceneElem = this.elem.find('.scene');
  this.controls = new app.Controls(this.elem, this.mapElem);

  this.gameAspectRatio = 1600 / 900;
  this.drawerHeight = 0;
  this.paused = false;
  this.isPlaying = false;
  this.lastFrame = 0;
  this.requestId = 0;

  /** @type {{height: number, width: number}} */
  this.mapDimensions = { height: 0, width: 0 };
  this.map = new app.Map(this.mapElem, this.drawerElem, this.mapDimensions);

  this.onFrame_ = this.onFrame_.bind(this);
};

/**
 * Start the game
 * @export
 */
app.Game.prototype.start = function() {
  this.setupEventHandlers_();
  this.restart();
};

/**
 * Sets up event handlers for the game
 * @private
 */
app.Game.prototype.setupEventHandlers_ = function() {
  $(window).on('resize.santasearch orientationchange.santasearch',
      this.onResize_.bind(this));
};

/**
 * Get random distance offset for hints.
 * @return {number} The offset.
 * @private
 */
app.Game.prototype.getRandomHintDistanceOffset_ = function() {
  let hintDistance = app.Constants.HINT_RANDOM_DISTANCE;
  let random = Math.floor(Math.random() * hintDistance);

  // Will make it go either positive or negative
  let value = (hintDistance / 2) - random;

  return value / 100;
};

/**
 * Sets the zoom to 2 and pans the camera to where the character can be found
 * @param {app.Character} character The character.
 * @private
 */
app.Game.prototype.hintLocation_ = function(character) {
  // The location of the character is a top/left percentage of the map
  let characterLocation = character.location;

  let randomLeftOffset = this.getRandomHintDistanceOffset_();
  let randomTopOffset = this.getRandomHintDistanceOffset_();

  let leftScale = (0.5 - characterLocation.left) + randomLeftOffset;
  let topScale = (0.5 - characterLocation.top) + randomTopOffset;

  let targetX = this.mapDimensions.width * leftScale;
  let targetY = this.mapDimensions.height * topScale;

  this.panAndScaleToTarget_(this.controls.scale, app.Constants.HINT_ZOOM,
      targetX, targetY, app.Constants.HINT_BUTTON_PAN_TIME);
};

/**
 * @param {number} scaleTarget
 * @private
 */
app.Game.prototype.preScale_ = function(scaleTarget) {
  this.controls.enabled = false;

  let scaleBefore = this.controls.scale;
  this.controls.scalePan(scaleBefore, scaleTarget);

  let panX = this.controls.pan.x;
  let panY = this.controls.pan.y;

  this.panAndScaleToTarget_(scaleBefore, scaleTarget, panX, panY,
      app.Constants.PRESCALE_TIME);
};

/**
 * @param {number} scaleBefore
 * @param {number} scaleTarget
 * @param {number} panX
 * @param {number} panY
 * @param {number} transitionTime
 * @private
 */
app.Game.prototype.panAndScaleToTarget_ = function(scaleBefore, scaleTarget,
    panX, panY, transitionTime) {
  this.controls.enabled = false;

  let scale = scaleTarget / scaleBefore;

  let width = this.mapDimensions.width * scale;
  let height = this.mapDimensions.height * scale;

  let targetX = this.clampXPanForWidth_(panX, width);
  let targetY = this.clampYPanForHeight_(panY, height);

  this.mapElem.css('transition-duration', `${transitionTime}s`);
  this.mapElem.css('transform',
      `translate3d(${targetX}px, ${targetY}px, 0) scale(${scale}, ${scale})`);

  setTimeout(() => {
    this.mapElem.css('transition-duration', '0s');
    this.controls.enabled = true;
    this.controls.scale = scaleTarget;
    this.controls.pan.x = targetX;
    this.controls.pan.y = targetY;
    this.controls.needsScaleUpdate = true;
    this.controls.needsPanUpdate = true;
  }, transitionTime * 1000);
};

/**
 * Scales the map when the user wants to zoom in our out
 * @param {number} value Scale factor.
 * @private
 */
app.Game.prototype.scale_ = function(value) {
  let windowAspectRatio = this.elem.width() / this.elem.height();

  if (windowAspectRatio < this.gameAspectRatio) {
    this.mapDimensions.width = this.elem.height() * this.gameAspectRatio;
    this.mapDimensions.height = +this.elem.height();
  } else {
    this.mapDimensions.width = +this.elem.width();
    this.mapDimensions.height = this.elem.width() / this.gameAspectRatio;
  }

  this.mapDimensions.width *= value;
  this.mapDimensions.height *= value;

  this.mapElem.css('width', this.mapDimensions.width);
  this.mapElem.css('height', this.mapDimensions.height);

  this.mapElem.css('margin-left', -(this.mapDimensions.width / 2));
  this.mapElem.css('margin-top', -(this.mapDimensions.height / 2));

  this.map.updateCharacters();
};

/**
 * @param {number} panX
 * @param {number} width
 * @return {number}
 * @private
 */
app.Game.prototype.clampXPanForWidth_ = function(panX, width) {
  let max = (width - this.elem.width()) / 2;

  let diff = max - Math.abs(panX);

  if (diff < 0) {
    panX = (panX < 0) ? -max : max;
  }

  return panX;
};

/**
 * @param {number} panY
 * @param {number} height
 * @return {number}
 * @private
 */
app.Game.prototype.clampYPanForHeight_ = function(panY, height) {
  let max = (height - this.elem.height()) / 2;

  if (panY < 0) {
    max += this.drawerHeight;
  }

  let diff = max - Math.abs(panY);

  if (diff < 0) {
    panY = (panY < 0) ? -max : max;
  }

  return panY;
};

/**
 * Makes sure that the player can not pan out of the map
 * @private
 */
app.Game.prototype.updatePan_ = function() {
  let panX = this.controls.pan.x;
  let mapWidth = this.mapDimensions.width;

  let panY = this.controls.pan.y;
  let mapHeight = this.mapDimensions.height;

  this.controls.pan.x = this.clampXPanForWidth_(panX, mapWidth);
  this.controls.pan.y = this.clampYPanForHeight_(panY, mapHeight);
};

/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  this.paused = false;
  this.onResize_();

  window.santaApp.fire('analytics-track-game-start', {gameid: 'santasearch'});
  this.gameStartTime = +new Date;
  this.unfreezeGame();

  this.controls.reset();
  this.scale_(1);
  this.map.setMap('museum');

  this.controls.start();
};

/**
 * Updates game state since last frame.
 * @param {number} delta Time elapsed since last update in milliseconds
 */
app.Game.prototype.update = function(delta) {
  if (!this.isPlaying) {
    return;
  }

  if (this.map.allFound) {
    this.gameover();
    return;
  }

  if (this.map.hintTarget) {
    this.hintLocation_(this.map.hintTarget);
    this.map.hintTarget = undefined;
  }

  if (this.controls.scaleTarget) {
    this.preScale_(this.controls.scaleTarget);
    this.controls.scaleTarget = undefined;
  }

  if (this.controls.needsScaleUpdate && this.controls.enabled) {
    this.scale_(this.controls.scale);
    this.controls.needsScaleUpdate = false;
  }

  if (this.controls.needsPanUpdate && this.controls.enabled) {
    this.updatePan_();

    let panX = this.controls.pan.x;
    let panY = this.controls.pan.y;

    this.mapElem.css('transform', `translate3d(${panX}px, ${panY}px, 0)`);
    this.controls.needsPanUpdate = false;
  }
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
    this.requestId = app.shared.utils.requestAnimFrame(this.onFrame_);
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

  // Update game state
  this.update(delta);

  // Request next frame
  this.requestId = app.shared.utils.requestAnimFrame(this.onFrame_);
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
 * Pauses/unpauses the game.
 */
app.Game.prototype.togglePause = function() {
  if (this.paused) {
    this.resume();
  } else if (this.isPlaying) {
    // Only allow pausing if the game is playing (not game over).
    this.pause();
  }
};

/**
 * Makes sure the map will never be smaller than the window.
 * @private
 */
app.Game.prototype.onResize_ = function() {
  let width = this.elem.width();
  let height = this.elem.height();
  let windowWidthLargerThanMap = width > this.mapDimensions.width;
  let windowHeightLargerThanMap = height > this.mapDimensions.height;

  let mapNeedsResizing = windowWidthLargerThanMap || windowHeightLargerThanMap;

  if (mapNeedsResizing) {
    this.scale_(this.controls.scale);
  }

  // Scale GUI
  var scale = Math.min(1, this.elem.width() / 1200);
  this.guiElem.css('font-size', scale + 'px');
  this.drawerHeight = +this.drawerElem.height();
};

/**
 * The game is over.
 */
app.Game.prototype.gameover = function() {
  this.gameoverModal.show();
};

/**
 * Dispose the game.
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    var opts = {
      gameid: 'santasearch',
      timePlayed: new Date - this.gameStartTime,
      level: 1,
    };
    window.santaApp.fire('analytics-track-game-quit', opts);
  }

  this.freezeGame();

  app.shared.utils.cancelAnimFrame(this.requestId);
  $(window).off('.santasearch');
  $(document).off('.santasearch');
  this.elem.off('.santasearch');
};
