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

goog.provide('app.Marker');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * Marker tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the color.
 */
app.Marker = function($elem, name) {
  app.Tool.call(this, $elem, name);

  this.soundKey = name;
  this.points = [];
};
app.Marker.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 * @param  {!string} color  The current color setting
 * @return {boolean} Whether the canvas was changed
 */
app.Marker.prototype.draw = function(canvas, mouseCoords, prevCanvas, size,
    color) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;

  this.points.push({
      x: drawX,
      y: drawY
    });

  if (this.points.length == 1) {
    var p1 = this.points[0];
    context.fillStyle = color;
    context.beginPath();
    context.arc(p1.x, p1.y, this.currentSize / 2, 0 ,2 * Math.PI);
    context.fill();
  } else if (this.points.length == 2) {
    var p1 = this.points[0];
    var p2 = this.points[1];
    var midpoint = app.utils.midpoint(p1, p2);
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = this.currentSize;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(midpoint.x, midpoint.y);
    context.stroke();
  } else {
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = this.currentSize;
    context.strokeStyle = color;
    var p0 = this.points[this.points.length - 3];
    var p1 = this.points[this.points.length - 2];
    var p2 = this.points[this.points.length - 1];
    var midpoint1 = app.utils.midpoint(p0, p1);
    var midpoint2 = app.utils.midpoint(p1, p2);
    context.beginPath();
    context.moveTo(midpoint1.x, midpoint1.y);
    context.quadraticCurveTo(
      p1.x,
      p1.y,
      midpoint2.x,
      midpoint2.y
    );
    context.stroke();
  }

  return true;
};


/**
 * Resets the pen path
 */
app.Marker.prototype.reset = function() {
  this.points = [];
}


app.Marker.prototype.calculateDrawSize = function(size) {
  return app.utils.map(size, app.Constants.PEN_MIN,
      app.Constants.PEN_MAX);
}
