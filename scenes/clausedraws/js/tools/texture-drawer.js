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

goog.provide('app.TextureDrawer');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * TextureDrawer tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 */
app.TextureDrawer = function($elem, name, opacity) {
  app.Tool.call(this, $elem, name);

  this.soundKey = 'selfie_color';
  this.opacity = opacity || 1;
  this.drawFrequency = 4;
  this.inputPoints = [];
  this.drawPoints = [];
};
app.TextureDrawer.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 * @param  {!string} color  The current color setting
 * @return {boolean} Whether the canvas was changed
 */
app.TextureDrawer.prototype.draw = function(canvas, mouseCoords, prevCanvas, size,
    color) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var drawWidth = this.currentSize;
  var drawHeight = this.currentSize;
  var offsetX = this.currentSize / 2;
  var offsetY = this.currentSize / 2;
  var texture = this.elem.find('#' + this.name + '-' + color.substring(1))[0];

  this.inputPoints.push({
      x: drawX,
      y: drawY
    });

  if (this.inputPoints.length > 1) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(prevCanvas, 0, 0, canvas.width, canvas.height);
    var rotation = 0;
    var lastPoint = this.inputPoints[0];
    context.drawImage(texture, lastPoint.x - offsetX, lastPoint.y - offsetY,
        drawWidth, drawHeight);

    for (var i = 1; i < this.inputPoints.length - 1; i++) {
      var p1 = this.inputPoints[i];
      var p2 = this.inputPoints[i + 1];
      var midpoint = app.utils.midpoint(p1, p2);
      var distance = app.utils.distance(lastPoint, midpoint);

      for (var j = 0; j < distance; j += this.currentSize / this.drawFrequency) {
        var t = j / distance;
        var point = app.utils.pointInCurve(t, lastPoint, p1, midpoint);
        rotation += Math.PI / 5;
        this.drawPoints.push(point);

        context.save();
        context.globalAlpha = this.opacity;
        context.translate(point.x, point.y);
        context.rotate(rotation * 2 * Math.PI);
        context.drawImage(texture, -offsetX, -offsetY,
            drawWidth, drawHeight);
        context.restore();
      }

      lastPoint = midpoint;
    }
  } else {
    context.drawImage(texture, drawX - offsetX,
        drawY - offsetY, drawWidth, drawHeight);
  }

  return true;
};


/**
 * Resets the pen path
 */
app.TextureDrawer.prototype.reset = function() {
  this.inputPoints = [];
  this.drawPoints = [];
}


app.TextureDrawer.prototype.calculateDrawSize = function(size) {
  return app.utils.map(size, app.Constants.PEN_MIN,
      app.Constants.PEN_MAX);
}


