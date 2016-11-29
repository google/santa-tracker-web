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

goog.require('app.Constants');

/**
 * Handles user input for controlling the postcard share scene.
 * @param {!Scene} scene The scene object.
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

  this.limitOnKeyDown_ = throttle(this.onKeyDown_.bind(this), 500);

  // Let's bind our events.
  $(window).on('keydown.sendamessage', this.limitOnKeyDown_);
  this.scene.elem.on('touchstart.sendamessage', this.handleTouchStart_.bind(this));
  this.scene.elem.on('touchend.sendamessage', this.handleTouchEnd_.bind(this));
};

/**
 * Handles the key down event.
 * @private
 * @param {Event} e The event object.
 */
app.Controls.prototype.onKeyDown_ = function(e) {
  var key;
  if (e.keyCode in app.Controls.KEY_CODES_) {
    key = app.Controls.KEY_CODES_[e.keyCode];
  }

  switch (key) {
    case 'left':
      this.picker.navigate(-1, 0);
      break;
    case 'right':
      this.picker.navigate(1, 0);
      break;
  }

  if (!this.leftRightPressed && (key === 'left' || key === 'right')) {
    this.tutorial.off('keys-leftright');
    this.tutorial.off('spacenav-leftright');
    this.leftRightPressed = true;
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
  '39': 'right',
};

/**
 * Hande start of touch, save position for later.
 * @param {Event} event The touch event.
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
  if (!this.leftRightSwiped && x !== 0) {
    this.tutorial.off('touch-leftright');
    this.leftRightSwiped = true;
  }
  this.picker.navigate(x);
};
