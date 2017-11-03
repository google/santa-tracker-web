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

goog.provide('app.Crayon');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * Crayon tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the color.
 */
app.Crayon = function($elem, name) {
  app.Tool.call(this, $elem, name);

  this.soundKey = 'selfie_color';

  this.lastPoint = null;
};
app.Crayon.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 * @param  {!string} color  The current color setting
 * @return {boolean} Whether the canvas was changed
 */
app.Crayon.prototype.draw = function(canvas, mouseCoords, prevCanvas, size,
    color) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var drawWidth = this.currentSize;
  var drawHeight = this.currentSize;
  var offsetX = this.currentSize / 2;
  var offsetY = this.currentSize / 2;
  var texture = this.elem.find('#crayon-' + color.substring(1))[0];

  if (this.lastPoint) {
    var distance = app.utils.distance(drawX - this.lastPoint.x,
      drawY - this.lastPoint.y);
    var angle = app.utils.angle(this.lastPoint.x, this.lastPoint.y, drawX,
        drawY);
    var count = 0;
    for (var i = 0; i <= distance; i += this.currentSize / 5) {
      x = this.lastPoint.x + (Math.sin(angle) * i);
      y = this.lastPoint.y + (Math.cos(angle) * i);

      context.save();
      context.translate(x, y);
      context.rotate(Math.random() * 2 * Math.PI);
      context.drawImage(texture, -offsetX, -offsetY,
          drawWidth, drawHeight);
      context.restore();
    }
  } else {
    context.drawImage(texture, drawX - offsetX,
        drawY - offsetY, drawWidth, drawHeight);
  }

  this.lastPoint = {x: drawX, y: drawY};
  return true;
};


/**
 * Resets the pen path
 */
app.Crayon.prototype.reset = function() {
  this.lastPoint = null;
}


app.Crayon.prototype.calculateDrawSize = function(size) {
  return app.utils.map(size, app.Constants.PEN_MIN,
      app.Constants.PEN_MAX);
}


