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

goog.provide('app.Neon');
goog.require('app.Constants');
goog.require('app.Marker');
goog.require('app.utils');


/**
 * Neon tool
 * @constructor
 * @extends {app.Marker}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the color.
 */
app.Neon = function($elem, name) {
  app.Marker.call(this, $elem, name);
  this.soundKey = name;
  this.points = [];
  this.disableColorpicker = true;
};
app.Neon.prototype = Object.create(app.Marker.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 * @param  {!string} color  The current color setting
 * @return {boolean} Whether the canvas was changed
 */
app.Neon.prototype.draw = function(canvas, mouseCoords, prevCanvas, size) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;

  this.points.push({
      x: drawX,
      y: drawY
    });

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(prevCanvas, 0, 0, canvas.width, canvas.height);

  if (this.points.length > 1) {
    context.save();
    context.shadowColor = "#6ae5b9";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = this.currentSize * 5;
    context.fillStyle = '#fff';
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = this.currentSize;
    context.strokeStyle = '#fff';

    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);

    for (var i = 1; i < this.points.length; i++) {
      var p1 = this.points[i - 1];
      var p2 = this.points[i];
      var midpoint = app.utils.midpoint(p1, p2);
      context.quadraticCurveTo(p1.x, p1.y, midpoint.x, midpoint.y);
    }
    context.stroke();
    context.restore();
  }


  return true;
};


app.Neon.prototype.calculateDrawSize = function(size) {
  return app.utils.map(size, app.Constants.NEON_MIN,
      app.Constants.NEON_MAX);
}
