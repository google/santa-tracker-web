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
 * @param {!Element} elem The game element.
 * @constructor
 */
app.Controls = function(elem) {
  this.elem = elem;

  this.selecting = false;

  this.lastLocation = {
    x: undefined,
    y: undefined
  };

  this.pan = {
    x: 0,
    y: 0
  };
}

app.Controls.prototype.start = function() {
  let gameElement = $(this.elem);

  gameElement.on('touchstart.santasearch', this._onTouchstart.bind(this));
  gameElement.on('touchmove.santasearch', this._onTouchmove.bind(this));
  gameElement.on('touchend.santasearch', this._onTouchend.bind(this));

  gameElement.on('mousedown.santasearch', this._onMousedown.bind(this));
  gameElement.on('mousemove.santasearch', this._onMousemove.bind(this));
  gameElement.on('mouseup.santasearch', this._onMouseup.bind(this));
  gameElement.on('mouseleave.santasearch', this._onMouseup.bind(this));
};

app.Controls.prototype._updateLocation = function(x, y) {
  if (this.lastLocation.x !== undefined) {
    this.pan.x += x - this.lastLocation.x;
    this.pan.y += y - this.lastLocation.y;
  }

  this.lastLocation.x = x;
  this.lastLocation.y = y;
};

app.Controls.prototype._onTouchstart = function(e) {
  this.selecting = true;

  var touchX = e.originalEvent.changedTouches[0].clientX;
  var touchY = e.originalEvent.changedTouches[0].clientY;

  this._updateLocation(touchX, touchY);
};

app.Controls.prototype._onTouchmove = function(e) {
  if (this.selecting) {
    var touchX = e.originalEvent.changedTouches[0].clientX;
    var touchY = e.originalEvent.changedTouches[0].clientY;

    this._updateLocation(touchX, touchY);
  }
};

app.Controls.prototype._onTouchend = function(e) {
  var touchX = e.originalEvent.changedTouches[0].clientX;
  var touchY = e.originalEvent.changedTouches[0].clientY;

  this._updateLocation(touchX, touchY);

  this.lastLocation.x = undefined;
  this.lastLocation.y = undefined;
  this.selecting = false;
};

app.Controls.prototype._onMousedown = function(e) {
  this._updateLocation(e.clientX, e.clientY);

  this.selecting = true;
};

app.Controls.prototype._onMousemove = function(e) {
  if (this.selecting) {
    this._updateLocation(e.clientX, e.clientY);
  }
};

app.Controls.prototype._onMouseup = function(e) {
  this._updateLocation(e.clientX, e.clientY);

  this.lastLocation.x = undefined;
  this.lastLocation.y = undefined;

  this.selecting = false;
};
