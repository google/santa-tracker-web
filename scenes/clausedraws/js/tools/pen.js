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

goog.provide('app.Pen');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * Pen tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the color.
 */
app.Pen = function($elem, name) {
  app.Tool.call(this, $elem, name);

  this.soundKey = 'selfie_color';
  this.points = [];
  this.dpr = 1;
};
app.Pen.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 * @param  {!string} color  The current color setting
 * @return {boolean} Whether the canvas was changed
 */
app.Pen.prototype.draw = function(canvas, mouseCoords, prevCanvas, size,
    color) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;

  this.points.push({
      x: drawX,
      y: drawY
    });

  if (this.points.length > 1) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(prevCanvas, 0, 0, canvas.width, canvas.height);
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = app.utils.map(size, app.Constants.PEN_MIN,
        app.Constants.PEN_MAX);
    context.strokeStyle = color;
    var p1 = this.points[0];
    var p2 = this.points[1];
    context.beginPath();
    context.moveTo(p1.x * this.dpr, p1.y * this.dpr);

    for (var i = 0; i < this.points.length - 1; i++) {
      p1 = this.points[i];
      p2 = this.points[i + 1];
      var midpoint = {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
      };

      context.quadraticCurveTo(
        p1.x * this.dpr,
        p1.y * this.dpr,
        midpoint.x * this.dpr,
        midpoint.y * this.dpr
      );
    }

    context.stroke();
  }
  return true;
};


/**
 * Resets the pen path
 */
app.Pen.prototype.reset = function() {
  this.points = [];
}


