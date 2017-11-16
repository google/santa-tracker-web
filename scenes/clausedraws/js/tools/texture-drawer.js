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
goog.require('app.ImageManager');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * TextureDrawer tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 */
app.TextureDrawer = function($elem, name, config) {
  app.Tool.call(this, $elem, name);

  this.soundKey = 'selfie_color';
  this.textureName = 'texture-' + name;
  this.opacity = config && config.opacity || 1;
  this.drawFrequency = config && config.drawFrequency || 4;
  this.sizeConfig = config && config.sizeConfig || {
      min: app.Constants.PEN_MIN,
      max: app.Constants.PEN_MAX
    };
  this.points = [];
  this.textures = {};
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
  var texture = app.ImageManager.getImage(this.textureName, color);

  this.points.push({
      x: drawX,
      y: drawY
    });

  if (this.points.length == 1) {
    var p1 = this.points[0];
    context.drawImage(texture, p1.x - offsetX, p1.y - offsetY,
        drawWidth, drawHeight);
  } else if (this.points.length == 2) {
    var p1 = this.points[0];
    var p2 = this.points[1];
    var midpoint = app.utils.midpoint(p1, p2);
    var distance = app.utils.distance(p1, midpoint);
    for (var j = 0; j < distance; j += this.currentSize / this.drawFrequency) {
      var t = j / distance;
      var point = app.utils.pointInCurve(t, p1, p1, midpoint);
      var rotation = Math.random();

      context.save();
      context.globalAlpha = this.opacity;
      context.translate(point.x, point.y);
      context.rotate(rotation * 2 * Math.PI);
      context.drawImage(texture, -offsetX, -offsetY,
          drawWidth, drawHeight);
      context.restore();
    }
  } else {
    var p0 = this.points[this.points.length - 3];
    var p1 = this.points[this.points.length - 2];
    var p2 = this.points[this.points.length - 1];
    var midpoint1 = app.utils.midpoint(p0, p1);
    var midpoint2 = app.utils.midpoint(p1, p2);
    var distance = app.utils.distance(midpoint1, midpoint2);
    for (var j = 0; j < distance; j += this.currentSize / this.drawFrequency) {
      var t = j / distance;
      var point = app.utils.pointInCurve(t, midpoint1, p1, midpoint2);
      var rotation = Math.random();

      context.save();
      context.globalAlpha = this.opacity;
      context.translate(point.x, point.y);
      context.rotate(rotation * 2 * Math.PI);
      context.drawImage(texture, -offsetX, -offsetY,
          drawWidth, drawHeight);
      context.restore();
    }
  }

  return true;
};


/**
 * Resets the pen path
 */
app.TextureDrawer.prototype.reset = function() {
  this.points = [];
}


app.TextureDrawer.prototype.calculateDrawSize = function(size) {
  return app.utils.map(size, this.sizeConfig.min,
      this.sizeConfig.max);
}
