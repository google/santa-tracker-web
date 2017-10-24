/*
 * Copyright 2017 Google Inc. All rights reserved.
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

goog.provide('app.Stamp');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * Stamp tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the stamp
 * @param {{x: number, y: number}} offset Tool offset relative to the mouse
 * @param {!Image} Stamp image.
 */
app.Stamp = function($elem, name, offset, stamp) {
  app.Tool.call(this, $elem, 'stamp-' + name, offset);

  this.stamp = stamp;
  this.soundKey = 'selfie_spray_small';
  this.stamped = false;
};
app.Stamp.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 */
app.Stamp.prototype.draw = function(canvas, mouseCoords, prevCanvas, size) {
  if (this.stamped) {
    return false;
  }

  var context = canvas.getContext('2d');
  var sizeMultiplier = app.utils.map(size, app.Constants.STAMP_MIN,
      app.Constants.STAMP_MAX);

  var drawWidth = this.stamp.width / mouseCoords.scale * sizeMultiplier;
  var drawHeight = this.stamp.height / mouseCoords.scale * sizeMultiplier;
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var offsetX = this.mouseOffset.x / mouseCoords.scale;
  var offsetY = this.mouseOffset.y / mouseCoords.scale;
  context.drawImage(this.stamp,
    drawX - offsetX, drawY - offsetY,
    drawWidth, drawHeight);
  this.stamped = true;

  return true;
};


/**
 * Start playing the tool's sound
 */
app.Stamp.prototype.startSound = function() {
  app.utils.triggerOnce(this.soundKey);
}


/**
 * Stop playing the tool's sound
 */
app.Stamp.prototype.stopSound = function() {
  app.utils.triggerReset(this.soundKey);
}


/**
 * Reset the stamp tool
 */
app.Stamp.prototype.reset = function() {
  this.stamped = false;
};

