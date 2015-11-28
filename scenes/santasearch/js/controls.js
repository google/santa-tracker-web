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
 * Handles user input for controlling the game.
 * @param {!Element} elem The game element.
 * @constructor
 */
app.Controls = function(elem, mapElem) {
  this.elem = elem;
  this.mapElem = mapElem;

  this.enabled = false;

  this.selecting = false;
  this.pinching = false;
  this.originalPinchDistance = undefined;
  this.originalPinchScale = undefined;

  this.lastLocation = {
    x: undefined,
    y: undefined
  };

  this.pan = {
    x: 0,
    y: 0
  };
  this.needsPanUpdate = false;

  this.scale = 1;
  this.needsScaleUpdate = false;
}

/**
 * Sets up event handlers for the controls.
 */
app.Controls.prototype.start = function() {
  let gameElement = $(this.elem);

  gameElement.on('touchstart.santasearch', this._onTouchstart.bind(this));
  gameElement.on('touchmove.santasearch', this._onTouchmove.bind(this));
  gameElement.on('touchend.santasearch', this._onTouchend.bind(this));

  gameElement.on('mousedown.santasearch', this._onMousedown.bind(this));
  gameElement.on('mousemove.santasearch', this._onMousemove.bind(this));
  gameElement.on('mouseup.santasearch', this._onMouseup.bind(this));
  gameElement.on('mouseleave.santasearch', this._onMouseup.bind(this));

  gameElement.find('.zoom__in').on('click', this._zoomIn.bind(this));
  gameElement.find('.zoom__out').on('click', this._zoomOut.bind(this));

  this.enabled = true;
};

app.Controls.prototype.reset = function() {
  this.scale = 1;
  this.pan.x = 0;
  this.pan.y = 0;
  this.pinching = false;
  this.selecting = false;

  this.scaleTarget = undefined;
}

/**
 * Updates pan based on location of user interaction
 * @param {number} x X coordinate of where the user is touching the screen.
 * @param {number} y Y coordinate of where the user is touching the screen.
 * @private
 */
app.Controls.prototype._updateLocation = function(x, y) {
  if (!this.enabled) {
    return;
  }

  if (this.lastLocation.x !== undefined) {
    this.pan.x += x - this.lastLocation.x;
    this.pan.y += y - this.lastLocation.y;

    this.needsPanUpdate = true;
  }

  this.lastLocation.x = x;
  this.lastLocation.y = y;
};

/**
 * Handles the touchstart event.
 * @param {Event} e The event object.
 * @private
 */
app.Controls.prototype._onTouchstart = function(e) {
  let touchCount = e.originalEvent.touches.length;

  if (e.target === this.mapElem[0]) {
    e.preventDefault();
  }

  if (touchCount === 1) {
    this.selecting = true;
    var touchX = e.originalEvent.changedTouches[0].clientX;
    var touchY = e.originalEvent.changedTouches[0].clientY;

    this._updateLocation(touchX, touchY);
  } else {
    this._pinchStart(e);
  }
};

/**
 * Handles the touchmove event.
 * @param {Event} e The event object.
 * @private
 */
app.Controls.prototype._onTouchmove = function(e) {
  let touchCount = e.originalEvent.touches.length;

  if (e.target === this.mapElem[0]) {
    e.preventDefault();
  }

  if (this.selecting && touchCount === 1) {
    var touchX = e.originalEvent.changedTouches[0].clientX;
    var touchY = e.originalEvent.changedTouches[0].clientY;

    this._updateLocation(touchX, touchY);
  } else if (this.pinching) {
    this._pinchMove(e);
  }
};

/**
 * Handles the touchend event.
 * @param {Event} e The event object.
 * @private
 */
app.Controls.prototype._onTouchend = function(e) {
  let touchCount = e.originalEvent.changedTouches.length;

  var touchX = e.originalEvent.changedTouches[0].clientX;
  var touchY = e.originalEvent.changedTouches[0].clientY;

  if (e.target === this.mapElem[0]) {
    e.preventDefault();
  }

  if (touchCount === 1) {
    this._updateLocation(touchX, touchY);
    this.selecting = false;
  } else {
    this._pinchEnd(e);
  }

  this.lastLocation.x = undefined;
  this.lastLocation.y = undefined;
};

app.Controls.prototype._calculatePinchDistance = function(e) {
  let firstTouch = {
    x: e.originalEvent.touches[0].clientX,
    y: e.originalEvent.touches[0].clientY
  };

  let secondTouch = {
    x: e.originalEvent.touches[1].clientX,
    y: e.originalEvent.touches[1].clientY
  };

  return Math.sqrt(Math.pow(secondTouch.x - firstTouch.x, 2) + Math.pow(secondTouch.y - firstTouch.y, 2));
};

app.Controls.prototype._pinchStart = function(e) {
  console.log('Pinch start');

  let distance = this._calculatePinchDistance(e);
  this.originalPinchDistance = distance;
  this.originalPinchScale = this.scale;

  this.pinching = true;
}

app.Controls.prototype._pinchMove = function(e) {
  console.log('Pinch move');

  let distance = this._calculatePinchDistance(e);
  this._scalePan(this.scale, this.originalPinchScale * (distance / this.originalPinchDistance));
}

app.Controls.prototype._pinchEnd = function(e) {
  console.log('Pinch end');

  this.pinching = false;
}

/**
 * Handles the mousedown event.
 * @param {Event} e The event object.
 * @private
 */
app.Controls.prototype._onMousedown = function(e) {
  this._updateLocation(e.clientX, e.clientY);

  this.selecting = true;
};

/**
 * Handles the mousemove event.
 * @param {Event} e The event object.
 * @private
 */
app.Controls.prototype._onMousemove = function(e) {
  if (this.selecting) {
    this._updateLocation(e.clientX, e.clientY);
  }
};

/**
 * Handles the mouseup event.
 * @param {Event} e The event object.
 * @private
 */
app.Controls.prototype._onMouseup = function(e) {
  this._updateLocation(e.clientX, e.clientY);

  this.lastLocation.x = undefined;
  this.lastLocation.y = undefined;

  this.selecting = false;
};

app.Controls.prototype._scalePan = function(from, to) {
  let direction = to - from;
  let difference = Math.abs(direction);

  if (to < 1) {
    to = 1;
  }

  if (to > app.Constants.ZOOM_MAX) {
    to = app.Constants.ZOOM_MAX;
  }

  this.pan.x *= (to / from);
  this.pan.y *= (to / from);
  this.scale = to;

  if (this.scale === 1) {
    this.pan.x = 0;
    this.pan.y = 0;
  }

  this.needsPanUpdate = true;
  this.needsScaleUpdate = true;
}

/**
 * Handles zooming in when the user clicks the zoom-in element.
 * @private
 */
app.Controls.prototype._zoomIn = function() {
  if (!this.enabled || this.scale === app.Constants.ZOOM_MAX) {
    return;
  }

  let scaleTarget = this.scale + app.Constants.ZOOM_STEP_SIZE;

  if (scaleTarget <= app.Constants.ZOOM_MAX) {
    this.scaleTarget = scaleTarget;
  } else {
    this.scaleTarget = app.Constants.ZOOM_MAX;
  }
};

/**
 * Handles zooming out when the user clicks the zoom-out element.
 * @private
 */
app.Controls.prototype._zoomOut = function() {
  if (!this.enabled || this.scale === 1) {
    return;
  }

  let scaleTarget = this.scale - app.Constants.ZOOM_STEP_SIZE;

  if (scaleTarget >= 1) {
    this.scaleTarget = scaleTarget;
  } else {
    this.scaleTarget = 1;
  }
};
