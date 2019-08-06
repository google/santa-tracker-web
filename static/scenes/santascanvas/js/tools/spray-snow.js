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

goog.provide('app.SpraySnow');
goog.require('app.Constants');


/**
 * Spray can that sprays sprinkles
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {!string} name The name of the tool.
 */
app.SpraySnow = function($elem, name) {
  app.Tool.call(this, $elem, name);

  this.soundKey = name;
  this.density = app.Constants.SPRAY_SNOW_DENSITY;
  this.maxOffset = app.Constants.SPRAY_SNOW_OFFSET;

  this.disableResize = true;
  this.disableColorpicker = true;
};
app.SpraySnow.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 */
app.SpraySnow.prototype.draw = function(canvas, mouseCoords) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;

  for (var i = 0; i < this.density; i++) {
    var size = Math.random() * app.Constants.SPRAY_SNOW_MAX_SIZE;
    var opacity = Math.random() * (1 - app.Constants.SPRAY_SNOW_MIN_OPACITY) +
        app.Constants.SPRAY_SNOW_MIN_OPACITY;

    context.save();
    context.fillStyle = 'rgba(242, 250, 255, ' + opacity + ')';
    context.beginPath();
    context.arc(drawX + this.getRandomOffset(), drawY + this.getRandomOffset(),
        size, 0, 2 * Math.PI);
    context.fill();
    context.restore();
  }

  return true;
};


app.SpraySnow.prototype.getRandomOffset = function() {
  return Math.random() * this.maxOffset * 2 - this.maxOffset;
};


app.SpraySnow.prototype.calculateDrawSize = function() {
  return app.Constants.SPRAY_CIRCLE_SIZE;
};
