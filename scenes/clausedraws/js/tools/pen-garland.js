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

goog.provide('app.PenGarland');
goog.require('app.Constants');
goog.require('app.ImageManager');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * PenGarland tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 */
app.PenGarland = function($elem, name, config) {
  app.Tool.call(this, $elem, name);

  this.soundKey = 'selfie_color';
  this.textureName = 'texture-' + name;
  this.opacity = config && config.opacity || 1;
  this.drawFrequency = config && config.drawFrequency || 4;
  this.points = [];
  this.monotone = config && config.monotone || false;
  this.noRotation = config && config.noRotation || false;
  this.sizeConfig = config && config.sizeConfig || {
      min: app.Constants.PEN_MIN,
      max: app.Constants.PEN_MAX
    };

  if (this.monotone) {
    this.$image = $elem.find('#' + this.textureName);
    this.image = this.$image[0];
    this.height = this.$image.height();
    this.width = this.$image.width();
  }

  this.spacing = 100;
  this.spaceUntilNext = 0;
};
app.PenGarland.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 * @param  {!string} color  The current color setting
 * @return {boolean} Whether the canvas was changed
 */
app.PenGarland.prototype.draw = function(canvas, mouseCoords, prevCanvas,
    size, color) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var drawWidth = this.currentSize;
  var drawHeight = this.currentSize;

  if (this.sizeConfig.scale) {
    drawWidth = this.sizeFactor * this.width;
    drawHeight = this.sizeFactor * this.height;
  }

  var offsetX = drawWidth / 2;
  var offsetY = drawHeight / 2;
  var texture;
  if (this.monotone) {
    texture = this.image;
  } else {
    texture = app.ImageManager.getImage(this.textureName, color);
  }

  this.points.push({
      x: drawX,
      y: drawY
    });

  if (this.points.length == 1) {
    var p1 = this.points[0];
    context.drawImage(texture, p1.x - offsetX, p1.y - offsetY,
        drawWidth, drawHeight);
    this.spaceUntilNext = this.spacing;
  } else if (this.points.length == 2) {
    var p1 = this.points[0];
    var p2 = this.points[1];
    var midpoint = app.utils.midpoint(p1, p2);
    this.drawAlongCurve(p1, p1, midpoint, context, texture, drawX, drawY,
        drawWidth, drawHeight, offsetX, offsetY);
  } else {
    var p0 = this.points[this.points.length - 3];
    var p1 = this.points[this.points.length - 2];
    var p2 = this.points[this.points.length - 1];
    var midpoint1 = app.utils.midpoint(p0, p1);
    var midpoint2 = app.utils.midpoint(p1, p2);
    this.drawAlongCurve(midpoint1, p1, midpoint2, context, texture, drawX,
        drawY, drawWidth, drawHeight, offsetX, offsetY);
  }

  return true;
};


/**
 * Resets the pen path
 */
app.PenGarland.prototype.reset = function() {
  this.points = [];
  this.spaceUntilNext = 0;
};


app.PenGarland.prototype.drawAlongCurve = function(start, control, end, context,
    texture, drawX, drawY, drawWidth, drawHeight, offsetX, offsetY) {
  var distance = app.utils.curveLength(start, control, end);
  if (!distance) {
    return;
  }

  console.log(distance, this.spaceUntilNext);

  if (distance > this.spaceUntilNext) {
    var currentPoint = this.spaceUntilNext;

    while (currentPoint < distance) {
      var t = currentPoint / distance;
      var point = app.utils.pointInCurve(t, start, control, end);
      var rotation = this.noRotation ? 0 : Math.random();
      context.save();
      context.globalAlpha = this.opacity;
      context.translate(point.x, point.y);
      context.rotate(rotation * 2 * Math.PI);
      context.drawImage(texture, -offsetX, -offsetY,
          drawWidth, drawHeight);
      context.restore();

      currentPoint += this.spacing;
    }

    this.spaceUntilNext = currentPoint - distance;
  } else {
    this.spaceUntilNext -= distance;
  }
};


app.PenGarland.prototype.calculateDrawSize = function(size) {
  if (this.sizeConfig.scale) {
    var dimension = Math.max(this.height, this.width);
    this.sizeFactor = app.utils.map(size, this.sizeConfig.min,
        this.sizeConfig.max);
    return dimension * this.sizeFactor;
  } else {
    return app.utils.map(size, this.sizeConfig.min,
        this.sizeConfig.max);
  }
}
