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
 * @param {!app.Scene} scene The scene object.
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
 * Cleans up.
 */
app.Controls.prototype.dispose = function() {
  $(window).off('keydown.sendamessage');
};

/**
 * Handles the key down event.
 * @private
 * @param {!jQuery.Event} e The event object.
 */
app.Controls.prototype.onKeyDown_ = function(e) {
  switch (e.keyCode) {
  case 37:  // left
    this.picker.navigate(-1, 0);
    break;
  case 39:  // right
    this.picker.navigate(1, 0);
    break;
  default:
    return;
  }

  if (!this.leftRightPressed) {
    this.tutorial.off('keys-leftright');
    this.tutorial.off('spacenav-leftright');
    this.leftRightPressed = true;
  }
};

/**
 * Hande start of touch, save position for later.
 * @param {!jQuery.Event} event The touch event.
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
 * @param {!jQuery.Event} event The touch event.
 * @private
 */
app.Controls.prototype.handleTouchEnd_ = function(event) {
  var touch = event.changedTouches[0];
  var x = this.getChange_(touch.pageX - this.start.x);
  if (!this.leftRightSwiped && x !== 0) {
    this.tutorial.off('touch-leftright');
    this.leftRightSwiped = true;
  }
  this.picker.navigate(x);
};
