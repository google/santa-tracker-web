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
 * @param {Game} game The game object.
 * @constructor
 */
app.Controls = function(game) {
  // This is what we're controlling
  this.game = game;
  this.player = this.game.player;
  this.tutorial = this.game.tutorial;
  this.currentOrientation = window.orientation;
  this.accelX = 0;
  this.accelY = 0;

  // Some laptops expose accelerometers to the browser (non-retina Macbook Pro's)
  // This check will have to do, unless someone can propose a better one.
  this.isDesktopish = !Modernizr.touch;

  // Key states
  this.keys = {};

  // Let's bind our events.
  var handler = this.handle.bind(this);
  $(window).on('keydown.glider keyup.glider', handler)
      .on('deviceorientation.glider', handler)
      .on('devicemotion.glider', handler)
      .on('touchend.glider', handler);
};

/**
 * Handle all keyboard events.
 * @param {event} e The event data.
 */
app.Controls.prototype.handle = function(e) {
  // Paused or Gameover
  if (!this.game.isPlaying) {
    return;
  }

  var methodName = 'on' + e.type[0].toUpperCase() + e.type.slice(1);
  this[methodName](e);
};

/**
 * Track if an arrow button has never been pressed, to notify tutorial.
 * @type {bool}
 * @private
 */
app.Controls.prototype.arrowPressed_ = false;

/**
 * Track if space has never been pressed, to notify tutorial.
 * @type {bool}
 * @private
 */
app.Controls.prototype.spacePressed_ = false;

/**
 * Keep track of device orientation in degrees.
 * @type {Number}
 */
app.Controls.prototype.tilt = 0;

/**
 * Handles the device orientation event.
 * @param  {Event} e The event object.
 */
app.Controls.prototype.onDeviceorientation = function(e) {
  e = e.originalEvent;
  if (e.gamma == null || this.isDesktopish) {
    return;
  }

  // Portrait
  var degree = e.gamma;

  // Landscape
  if (window.orientation) {
    var dir = window.orientation / 90;
    degree = e.beta * dir;
  }

  this.tilt = degree.toFixed(1); // temporary fix for shaking

  // Let tutorial know about rotation so it can hide the tutorial.
  if (!this.tiltStarted && this.tilt > 2) {
    this.tutorial.off('device-tilt');
    this.tiltStarted = true;
  }
};

/**
 * Reads current X and Y accelerations.
 * @param  {Event} e The event object.
 */
app.Controls.prototype.onDevicemotion = function(e) {
  e = e.originalEvent;
  this.accelX = e.accelerationIncludingGravity.x;
  this.accelY = e.accelerationIncludingGravity.y;
};

/**
 * Virtual method to reset.
 */
app.Controls.prototype.reset = function() {};

/**
 * Updates the input vector of the player each frame.
 * @param {number} delta Seconds since last frame.
 */
app.Controls.prototype.onFrame = function(delta) {
  var x = 0, y = 0, self = this;

  if (this.isDesktopish) {
    if (this.keys['left']) {
      x -= 0.6;
    }
    if (this.keys['right']) {
      x += 0.6;
    }
    if (this.keys['up']) {
      y -= 0.6;
    }
    if (this.keys['down']) {
      y += 0.6;
    }

    // drop presents
    if (this.keys['space']) {
      this.player.dropPresent();
    }
  } else {
    if (window.orientation == 90) {
      if (this.accelY > 1 && this.accelX > 1) {
        x -= 0.5;
        y -= 0.5;
      } else if (this.accelY < -1 && this.accelX > 1) {
        x += 0.5;
        y -= 0.5;
      } else if (this.accelY < -1 && this.accelX < -1) {
        x += 0.5;
        y += 0.5;
      } else if (this.accelY > 1 && this.accelX < -1) {
        x -= 0.5;
        y += 0.5;
      } else if (this.accelY > 1) {
        x -= 0.5;
      } else if (this.accelY < -1) {
        x += 0.5;
      } else if (this.accelX < -1) {
        y += 0.5;
      } else if (this.accelX > 1) {
        y -= 0.5;
      }
    } else if (window.orientation == -90) {
      if (this.accelY > 2 && this.accelX > 2) {
        x += 0.5;
        y += 0.5;
      } else if (this.accelY < -2 && this.accelX > 2) {
        x -= 0.5;
        y += 0.5;
      } else if (this.accelY < -2 && this.accelX < -2) {
        x -= 0.5;
        y -= 0.5;
      } else if (this.accelY > 2 && this.accelX < -2) {
        x += 0.5;
        y -= 0.5;
      } else if (this.accelY > 2) {
        x += 0.5;
      } else if (this.accelY < -2) {
        x -= 0.5;
      } else if (this.accelX < -2) {
        y -= 0.5;
      } else if (this.accelX > 2) {
        y += 0.5;
      }
    }
  }

  // Normalize it if it has a length greater than 1.
  var length = x * x + y * y;
  if (length > 1) {
    length = Math.sqrt(length);
    x = x / length;
    y = y / length;
  }

  this.player.inputVector.x = x;
  this.player.inputVector.y = y;
};

/**
 * Handles mobile tap event.
 * @param {Event} e The event object.
 */
app.Controls.prototype.onTouchend = function(e) {
  if (!this.isDesktopish) {
    this.player.dropPresent();
  }
};

/**
 * Handles the key down event.
 * @param {Event} e The event object.
 */
app.Controls.prototype.onKeydown = function(e) {
  if (e.keyCode in app.Controls.KEY_CODES_) {
    this.keys[app.Controls.KEY_CODES_[e.keyCode]] = true;
  }

  if (!this.arrowPressed_ && (this.keys['left'] || this.keys['right'] ||
                                 this.keys['up'] || this.keys['down'])) {
    this.game.tutorial.off('keys-arrows');
    this.arrowPressed_ = true;
  }

  if (!this.spacePressed_ && this.keys['space']) {
    this.game.tutorial.off('keys-space');
    this.spacePressed_ = true;
  }
};

/**
 * Handles the key up event.
 * @param {Event} e The event object.
 */
app.Controls.prototype.onKeyup = function(e) {
  if (e.keyCode in app.Controls.KEY_CODES_)
    this.keys[app.Controls.KEY_CODES_[e.keyCode]] = false;
};

/**
 * A map of keycodes to their names.
 * @type {Object.<string, string>}
 * @private
 * @const
 */
app.Controls.KEY_CODES_ = {
  '32': 'space',
  '37': 'left',
  '38': 'up',
  '39': 'right',
  '40': 'down'
};
