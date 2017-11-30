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
  this.soundKey = name;
  this.textureName = 'texture-' + name;
  this.points = [];
  this.sizeConfig = config && config.sizeConfig || {
      min: app.Constants.PEN_MIN,
      max: app.Constants.PEN_MAX
    };
  this.$image = $elem.find('#' + this.textureName);
  this.image = this.$image[0];
  this.height = this.$image.height();
  this.width = this.$image.width();
  this.lineColor = '';
  this.lineSize = 0;

  this.updateSize();
  this.spacing = this.currentSize * 2;
  this.spaceUntilNext = 0;

  this.disableColorpicker = true;
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

  var offsets = this.getOffsets(drawWidth, drawHeight);
  var offsetX = offsets.x;
  var offsetY = offsets.y;
  var texture = this.image;

  this.points.push({
      x: drawX,
      y: drawY
    });

  if (this.points.length == 1) {
    var p1 = this.points[0];
    this.drawAlongCurve(p1, p1, p1, context, texture, drawX, drawY,
        drawWidth, drawHeight, offsetX, offsetY);

    if (this.lineColor) {
      context.fillStyle = this.lineColor;
      context.beginPath();
      context.arc(p1.x, p1.y, this.lineSize / 2, 0 ,2 * Math.PI);
      context.fill();
    }
  } else if (this.points.length == 2) {
    var p1 = this.points[0];
    var p2 = this.points[1];
    var midpoint = app.utils.midpoint(p1, p2);
    this.drawAlongCurve(p1, p1, midpoint, context, texture, drawX, drawY,
        drawWidth, drawHeight, offsetX, offsetY);

    if (this.lineColor) {
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.lineWidth = this.lineSize;
      context.strokeStyle = this.lineColor;
      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(midpoint.x, midpoint.y);
      context.stroke();
    }
  } else {
    var p0 = this.points[this.points.length - 3];
    var p1 = this.points[this.points.length - 2];
    var p2 = this.points[this.points.length - 1];
    var midpoint1 = app.utils.midpoint(p0, p1);
    var midpoint2 = app.utils.midpoint(p1, p2);
    this.drawAlongCurve(midpoint1, p1, midpoint2, context, texture, drawX,
        drawY, drawWidth, drawHeight, offsetX, offsetY);

    if (this.lineColor) {
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.lineWidth = this.lineSize;
      context.strokeStyle = this.lineColor;
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
  }

  return true;
};


/**
 * Resets the pen path
 */
app.PenGarland.prototype.reset = function() {
  this.points = [];
  this.spaceUntilNext = 0;
  this.spacing = this.currentSize * 2;
};


app.PenGarland.prototype.drawAlongCurve = function(start, control, end, context,
    texture, drawX, drawY, drawWidth, drawHeight, offsetX, offsetY) {
  var distance = app.utils.curveLength(start, control, end);
  if (!distance || !isFinite(distance)) {
    return;
  }

  if (distance > this.spaceUntilNext) {
    var currentPoint = this.spaceUntilNext;

    while (currentPoint < distance) {
      var t = currentPoint / distance;
      var point = app.utils.pointInCurve(t, start, control, end);
      this.drawItem(context, texture, point, drawWidth, drawHeight, offsetX,
          offsetY);

      currentPoint += this.spacing;
    }

    window.santaApp.fire('sound-trigger', {name: 'cd_' + this.soundKey + '_oneshot', args: [this.sizeFactor]});

    this.spaceUntilNext = currentPoint - distance;
  } else {
    this.spaceUntilNext -= distance;
  }
};


app.PenGarland.prototype.drawItem = function(context, texture, point,
    drawWidth, drawHeight, offsetX, offsetY ) {
  context.save();
  context.translate(point.x, point.y);
  context.drawImage(texture, -offsetX, -offsetY,
      drawWidth, drawHeight);
  context.restore();
};


app.PenGarland.prototype.getOffsets = function(drawWidth, drawHeight) {
  return {
    x: drawWidth / 2,
    y: drawHeight / 2
  };
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
