goog.provide('app.Controls');

goog.require('app.Constants');
goog.require('app.utils');

/**
 * Handles user input for controlling the game.
 * @param {Scene} scene The scene object.
 * @constructor
 */
app.Controls = function(scene) {
  // This is what we're controlling
  this.scene = scene;
  this.picker = scene.picker;
  this.tutorial = scene.tutorial;

  // Key states
  this.keys = {};
  this.start = { x: 0, y: 0 };

  this.onKeydown = app.utils.throttle(this.onKeydown.bind(this), 500);

  // Let's bind our events.
  $(window).on('keydown.sendamessage', this.onKeydown);
  this.scene.elem.on('touchstart.sendamessage', this.handleTouchStart_.bind(this));
  this.scene.elem.on('touchend.sendamessage', this.handleTouchEnd_.bind(this));
};

/**
 * Handles the key down event.
 * @param {Event} e The event object.
 */
app.Controls.prototype.onKeydown = function(e) {
  var key;
  if (e.keyCode in app.Controls.KEY_CODES_)
    key = app.Controls.KEY_CODES_[e.keyCode];

  switch (key) {
    case 'left':
      this.picker.navigate(-1, 0);
      break;
    case 'right':
      this.picker.navigate(1, 0);
      break;
    case 'up':
      this.picker.navigate(0, -1);
      break;
    case 'down':
      this.picker.navigate(0, 1);
      break;
  }

  if (!this.leftRightPressed && (key === 'left' || key === 'right')) {
    this.tutorial.off('keys-leftright');
    this.leftRightPressed = true;
  }

  if (!this.upDownPressed && (key === 'up' || key === 'down')) {
    this.tutorial.off('keys-updown');
    this.upDownPressed = true;
  }
};

/**
 * A map of keycodes to their names.
 * @type {Object.<string, string>}
 * @private
 * @const
 */
app.Controls.KEY_CODES_ = {
  '37': 'left',
  '38': 'up',
  '39': 'right',
  '40': 'down'
};

/**
 * Hande start of touch, save position for later.
 * @param {Event} event The jQuery touch event.
 * @private
 */
app.Controls.prototype.handleTouchStart_ = function(event) {
  var touch = event.originalEvent.changedTouches[0];
  this.start.x = touch.pageX;
  this.start.y = touch.pageY;
  event.preventDefault();
  if ($(event.target).closest('.board').length ||
      $(event.target).closest('.overlay').length) {
    $(event.target).trigger('click');
  }
};

/**
 * Change movement in pixels to slide number with direction.
 * @param {number} movement Length of touch swipe.
 * @return {number} A number that is -1, 0 or 1.
 * @private
 */
app.Controls.prototype.getChange_ = function(movement) {
  if (Math.abs(movement) > app.Constants.TOUCH_TRESHOLD) {
    return movement < 0 ? 1 : -1;
  }
  return 0;
};

/**
 * Slide if touch passes the touch treshold.
 * @private
 */
app.Controls.prototype.handleTouchEnd_ = function() {
  var touch = event.changedTouches[0];
  var x = this.getChange_(touch.pageX - this.start.x);
  var y = this.getChange_(touch.pageY - this.start.y);
  if (!this.leftRightSwiped && x !== 0) {
    this.tutorial.off('touch-leftright');
    this.leftRightSwiped = true;
  }
  if (!this.upDownSwiped && y !== 0) {
    this.tutorial.off('touch-updown');
    this.upDownSwiped = true;
  }
  this.picker.navigate(x, y);
};
