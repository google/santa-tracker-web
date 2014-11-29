/* globals Modernizr */

goog.provide('app.Controls');

/**
 * Handles user input for controlling the game.
 * @param {app.Game} game The game object.
 * @constructor
 */
app.Controls = function(game) {
  // This is what we're controlling
  this.game = game;
  this.tutorial = game.tutorial;

  // Some laptops expose accelerometers to the browser (non-retina Macbook Pro's)
  // This check will have to do, unless someone can propose a better one.
  this.isDesktopish = !Modernizr.touch;

  // Let's bind our events.
  var handler = this.handle.bind(this);
  $(window).on('keydown.gumball keyup.gumball', handler)
      .on('deviceorientation.gumball', handler);
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
 * Keep track of the right key.
 * @type {bool}
 * @private
 */
app.Controls.prototype.isRightDown_ = false;

/**
 * Keep track of the left key.
 * @type {bool}
 * @private
 */
app.Controls.prototype.isLeftDown_ = false;

/**
 * Keep track of the space bar.
 * @type {bool}
 * @private
 */
app.Controls.prototype.isSpaceDown_ = false;

/**
 * Keep track of player movements.
 * @type {bool}
 * @private
 */
app.Controls.prototype.isMoving_ = false;

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
 * Handles the key down event. Called dynamically.
 * @param  {Event} e The event object.
 */
app.Controls.prototype.onKeydown = function(e) {
  if (e.keyCode === 37) { // Left
    this.isLeftDown_ = true;
  } else if (e.keyCode === 39) { // Right
    this.isRightDown_ = true;
  }

  if (!this.arrowPressed && (e.keyCode === 37 || e.keyCode === 39)) {
     // Let tutorial know if arrow has been pressed
     // and hide tutorial when user presses the button
     this.tutorial.off('keys-leftright');
     this.arrowPressed = true;
  }
};

/**
 * Handles the key up event. Called dynamically.
 * @param  {Event} e The event object.
 * @this {app.Controls} The Controls object.
 */
app.Controls.prototype.onKeyup = function(e) {
  if (e.keyCode === 37) { // Left
    this.isLeftDown_ = false;
  } else if (e.keyCode === 39) { // Right
    this.isRightDown_ = false;
  } else if (e.keyCode === 32) { // Space
    this.isSpaceDown_ = false;
  }
};
