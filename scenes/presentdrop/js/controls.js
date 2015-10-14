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

goog.provide('app.Controls');

/**
 * Handles user input for controlling the game.
 * @param {!app.Game} game The game object.
 * @constructor
 */
app.Controls = function(game) {
  // This is what we're controlling
  this.game = game;
  this.player = this.game.player;
  this.tutorial = this.game.tutorial;

  // For converting mouse/touch positions to stage positions.
  this.stage = this.game.elem.find('.stage');

  // Touch state
  this.currentTouchId = null;

  this.onTouchStart_ = this.onTouchStart_.bind(this);
  this.onTouchMove_ = this.onTouchMove_.bind(this);
  this.onTouchEnd_ = this.onTouchEnd_.bind(this);
  this.onKeyDown_ = this.onKeyDown_.bind(this);
  this.onKeyUp_ = this.onKeyUp_.bind(this);

  // Listeners removed as part of game dispose.
  this.game.elem.on('touchstart.presentdrop', this.onTouchStart_);
  this.game.elem.on('touchmove.presentdrop', this.onTouchMove_);
  this.game.elem.on('touchend.presentdrop', this.onTouchEnd_);
  $(window).on('keydown.presentdrop', this.onKeyDown_);
  $(window).on('keyup.presentdrop', this.onKeyUp_);
};

/**
 * Keep track of the right key.
 * @type {boolean}
 * @private
 */
app.Controls.prototype.isRightDown_ = false;

/**
 * Keep track of the left key.
 * @type {boolean}
 * @private
 */
app.Controls.prototype.isLeftDown_ = false;

/**
 * Keep track of the space bar.
 * @type {boolean}
 * @private
 */
app.Controls.prototype.isSpaceDown_ = false;

/**
 * Handles the key down event. Called dynamically.
 * @param {!Event} e The event object.
 * @private
 */
app.Controls.prototype.onKeyDown_ = function(e) {
  if (e.keyCode === 37) { // Left
    this.isLeftDown_ = true;
  } else if (e.keyCode === 39) { // Right
    this.isRightDown_ = true;
  } else if (e.keyCode === 32 && !this.isSpaceDown_) { // Space
    // Let tutorial know if space has been pressed
    // and hide tutorial when user presses the button
    if (!this.spacePressed) {
      this.tutorial.off('keys-space');
      this.spacePressed = true;
    }

    this.isSpaceDown_ = true;
    if (this.game.isPlaying) {
      this.player.dropPresent();
    }
  }

  if (!this.arrowPressed && (e.keyCode === 37 || e.keyCode === 39)) {
    // Let tutorial know if arrow has been pressed
    // and hide tutorial when user presses the button
    this.tutorial.off('keys-leftright');
    this.arrowPressed = true;
  }

  this.updatePlayerFromKeyboard();
};

/**
 * Handles the key up event. Called dynamically.
 * @param {Event} e The event object.
 * @private
 */
app.Controls.prototype.onKeyUp_ = function(e) {
  if (e.keyCode === 37) { // Left
    this.isLeftDown_ = false;
  } else if (e.keyCode === 39) { // Right
    this.isRightDown_ = false;
  } else if (e.keyCode === 32) { // Space
    this.isSpaceDown_ = false;
  }
  this.updatePlayerFromKeyboard();
};

/**
 * Updates the player.
 */
app.Controls.prototype.updatePlayerFromKeyboard = function() {
  if (this.isRightDown_) {
    this.player.keyboardGoRight();
  } else if (this.isLeftDown_) {
    this.player.keyboardGoLeft();
  } else {
    this.player.keyboardStop();
  }
};

/**
 * Touch controls
 */
app.Controls.prototype.touchStartedInGUI = null;

/**
 * Touch started. Ignores gui touches. Called dynamically.
 * @param {!Event} e The event object.
 */
app.Controls.prototype.onTouchStart_ = function(e) {
  if (!this.game.isPlaying) return;

  // Ignore the touch if it starts in GUI or if we are already tracking a touch.
  this.touchStartedInGUI = !!$(e.target).closest('.gui').length;
  if (this.currentTouchId !== null || this.touchStartedInGUI) {
    return;
  }

  var stagePos = this.stage.offset();
  var touch = e.changedTouches[0];

  // Correct position if game is scaled
  var touchX = touch.pageX / this.game.scale;
  var stageLeft = stagePos.left / this.game.scale;

  this.currentTouchId = touch.identifier;
  this.player.setX(touchX - stageLeft);
  e.preventDefault();

  // Let tutorial know about touch so it can hide the tutorial.
  if (!this.touchStarted) {
    this.tutorial.off('touch-leftright');
    this.touchStarted = true;
  }
};

/**
 * Touch moved. Called dynamically.
 * @param {!Event} e The event object.
 * @private
 */
app.Controls.prototype.onTouchMove_ = function(e) {
  if (!this.game.isPlaying) return;

  var touch = this.getCurrentTouch_(e);
  if (touch) {
    var stagePos = this.stage.offset();

    // Correct position if game is scaled
    var touchX = touch.pageX / this.game.scale;
    var stageLeft = stagePos.left / this.game.scale;

    this.player.setX(touchX - stageLeft);
  }
  e.preventDefault();
};

/**
 * Touch ended. Called dynamically.
 * @param {!Event} e The event object.
 * @private
 */
app.Controls.prototype.onTouchEnd_ = function(e) {
  var touch = this.getCurrentTouch_(e);
  if (!touch) {
    return;
  }

  this.currentTouchId = null;
  this.player.touchEnded();
};

/**
 * Returns the active touch from a touch event.
 * @param {!Event} e A touch event.
 * @return {Touch} The active touch.
 * @private
 */
app.Controls.prototype.getCurrentTouch_ = function(e) {
  if (this.currentTouchId === null) {
    return null;
  }
  for (var i = 0, touch; touch = e.changedTouches[i]; i++) {
    if (touch.identifier === this.currentTouchId) {
      return touch;
    }
  }
  return null;
};
