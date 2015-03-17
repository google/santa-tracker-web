/* globals Modernizr */

goog.provide('app.Controls');

/**
 * Handles user input for controlling the game.
 * @param {!app.Game} game The game object.
 * @constructor
 */
app.Controls = function(game) {
  // This is what we're controlling
  this.game = game;
  this.tutorial = game.tutorial;

  // Some laptops expose accelerometers to the browser (non-retina Macbook Pros)
  // This check will have to do, unless someone can propose a better one.
  this.isDesktopish_ = !Modernizr.touch;

  this.onKeyDown_ = this.onKeyDown_.bind(this);
  this.onKeyUp_ = this.onKeyUp_.bind(this);
  this.onDeviceOrientation_ = this.onDeviceOrientation_.bind(this);

  // Events are cleared by app.Game in its dispose method.
  $(window).on('keydown.gumball', this.onKeyDown_);
  $(window).on('keyup.gumball', this.onKeyUp_);
  $(window).on('deviceorientation.gumball', this.onDeviceOrientation_);
};

/**
 * Keep track of the right key.
 * @type {boolean}
 */
app.Controls.prototype.isRightDown = false;

/**
 * Keep track of the left key.
 * @type {boolean}
 */
app.Controls.prototype.isLeftDown = false;

/**
 * Keep track of device orientation, in degrees.
 * @type {number}
 */
app.Controls.prototype.tilt = 0;

/**
 * Handles the device orientation event.
 * @param {!Event} e The event object.
 * @private
 */
app.Controls.prototype.onDeviceOrientation_ = function(e) {
  e = e.originalEvent;
  if (e.gamma == null || this.isDesktopish_) {
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
 * @param {!Event} e The event object.
 * @private
 */
app.Controls.prototype.onKeyDown_ = function(e) {
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
 * @param {!Event} e The event object.
 * @private
 */
app.Controls.prototype.onKeyUp_ = function(e) {
  if (e.keyCode === 37) { // Left
    this.isLeftDown_ = false;
  } else if (e.keyCode === 39) { // Right
    this.isRightDown_ = false;
  }
};
