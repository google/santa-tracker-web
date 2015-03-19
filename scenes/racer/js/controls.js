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

goog.provide('Controls');

/**
 * Handles user input for controlling the game.
 * @param {!Game} game The game object.
 * @constructor
 */
Controls = function(game) {
  // This is what we're controlling
  this.game = game;
  this.tutorial = this.game.tutorial;

  // Key states
  this.keys = {};

  // Touch state
  this.keyPressed = false;
  this.touchStarted = false;
  this.currentTouchId = null;
  this.touchStart = { x: null, y: null };
  this.touchCurrent = { x: null, y: null };
  this.touchpadElem = $(game.elem).find('.touchpad');
  this.touchpadNubElem = this.touchpadElem.find('.touchpad-nub');
};

/**
 * Start controls for the game.
 */
Controls.prototype.start = function() {
  // Let's bind our events.
  $(window).on('keydown.racer', this.onKeydown.bind(this)).
      on('keyup.racer', this.onKeyup.bind(this));

  $(this.game.elem).on('touchstart.racer', this.onTouchstart.bind(this)).
      on('touchmove.racer', this.onTouchmove.bind(this)).
      on('touchend.racer', this.onTouchend.bind(this));
};

/**
 * Updates the input vector of the player each frame.
 * @param {number} delta Seconds since last frame.
 */
Controls.prototype.onFrame = function(delta) {
  var x = 0, y = 0;

  // Do we have an active touch?
  if (this.touchCurrent.x !== null) {
    x = (this.touchCurrent.x - this.touchStart.x) / Constants.TOUCH_SENSITIVITY;
    y = (this.touchCurrent.y - this.touchStart.y) / Constants.TOUCH_SENSITIVITY;

  // Otherwise check keyboard
  } else {
    if (this.keys['left']) {
      x--;
    }
    if (this.keys['right']) {
      x++;
    }
    if (this.keys['up']) {
      y--;
    }
    if (this.keys['down']) {
      y++;
    }
  }

  // Normalize it if it has a length greater than 1.
  var length = x * x + y * y;
  if (length > 1) {
    length = Math.sqrt(length);
    x = x / length;
    y = y / length;
  }

  // Update touchpad nub after normalization.
  if (this.touchCurrent.x !== null) {
    this.touchpadNubElem.css('transform', 'translate3d(' +
        (x * Constants.TOUCH_SENSITIVITY) + 'px,' +
        (y * Constants.TOUCH_SENSITIVITY) + 'px,0)');
  }

  this.game.inputVector.x = x;
  this.game.inputVector.y = y;

  if (this.game.inputVector.y >= 0 && y < 0) {
    window.santaApp.fire('sound-trigger', "rc_player_ride_start");
  } else if (this.game.inputVector.y <= 0 && y > 0) {
    window.santaApp.fire('sound-trigger', "rc_player_ride_stop");
  }
};

/**
 * Handles the key down event.
 * @param {Event} e The event object.
 */
Controls.prototype.onKeydown = function(e) {
  if (e.keyCode in Controls.KEY_CODES_) {
    this.keys[Controls.KEY_CODES_[e.keyCode]] = true;
  }

  // Let tutorial know when user presses a button
  if (!this.upPressed && this.keys['up']) {
    this.tutorial.off('keys-up');
    this.upPressed = true;
  }

  if (!this.leftRightPressed && (this.keys['left'] || this.keys['right'])) {
    this.tutorial.off('keys-leftright');
    this.leftRightPressed = true;
  }
};

/**
 * Handles the key up event.
 * @param {Event} e The event object.
 */
Controls.prototype.onKeyup = function(e) {
  if (e.keyCode in Controls.KEY_CODES_) {
    this.keys[Controls.KEY_CODES_[e.keyCode]] = false;
  }
};

/**
 * Did current touch start in GUI
 */
Controls.prototype.touchStartedInGUI = false;

/**
 * Handle touch start event. Displays a widget and remembers start position.
 * @param {Event} e The event object.
 */
Controls.prototype.onTouchstart = function(e) {
  // Ignore the touch if it starts in GUI or if we are already tracking a touch.
  this.touchStartedInGUI = !!$(e.target).closest('.gui').length;
  if (this.currentTouchId !== null || this.touchStartedInGUI) {
    return;
  }

  var touch = e.originalEvent.changedTouches[0];
  this.showTouchWidget(touch);
  e.preventDefault();

  // Let tutorial know about touch
  if (!this.touchStarted) {
    this.tutorial.off('touch-updown');
    this.touchStarted = true;
  }
};

/**
 * Handles the touch move up event. Registers current direction.
 * @param  {Event} e The event object.
 */
Controls.prototype.onTouchmove = function(e) {
  var touch = this.getCurrentTouch(e.originalEvent);
  if (touch) {
    this.touchCurrent.x = touch.pageX;
    this.touchCurrent.y = touch.pageY;
  }
  e.preventDefault();
};

/**
 * Handles the touch up event. Hide widget and stop moving.
 * @param  {Event} e The event object.
 */
Controls.prototype.onTouchend = function(e) {
  var touch = this.getCurrentTouch(e.originalEvent);
  if (!touch) {
    return;
  }
  this.hideTouchWidget();
};

/**
 * Returns the active touch from a touch event.
 * @param  {Event} e A touch event.
 * @return {Touch}   The active touch.
 */
Controls.prototype.getCurrentTouch = function(e) {
  if (this.currentTouchId === null) {
    return;
  }

  // Did it change?
  for (var i = 0, touch; touch = e.changedTouches[i]; i++) {
    if (touch.identifier === this.currentTouchId) {
      return touch;
    }
  }

  // Does it still exist.
  // iOS sometimes forgets to send a touchend event.
  for (var i = 0, touch; touch = e.targetTouches[i]; i++) {
    if (touch.identifier === this.currentTouchId) {
      return;
    }
  }
  this.hideTouchWidget();
};

/**
 * Shows the touch widget for the provided touch event.
 * @param  {TouchEvent} touch A touch event initiating the widget.
 */
Controls.prototype.showTouchWidget = function(touch) {
  this.currentTouchId = touch.identifier;
  this.touchStart.x = touch.pageX;
  this.touchStart.y = touch.pageY;
  this.touchpadElem.css({left: this.touchStart.x, top:this.touchStart.y}).removeClass('hidden');
  this.touchpadNubElem.css('transform', '');
};

/**
 * Hides the touch widget.
 */
Controls.prototype.hideTouchWidget = function() {
  this.currentTouchId = null;
  this.touchCurrent.x = null;
  this.touchCurrent.y = null;
  this.touchpadElem.addClass('hidden');
  this.touchpadNubElem.css('transform', '');
};

/**
 * A map of keycodes to their names.
 * @type {Object.<string, string>}
 * @private
 * @const
 */
Controls.KEY_CODES_ = {
  '37': 'left',
  '38': 'up',
  '39': 'right',
  '40': 'down'
};
