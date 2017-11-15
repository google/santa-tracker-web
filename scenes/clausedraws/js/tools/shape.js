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

goog.provide('app.Shape');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');
goog.require('app.ImageManager');


/**
 * Shape tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the shape
 */
app.Shape = function($elem, name) {
  app.Tool.call(this, $elem, 'shape-' + name);

  this.shapeName = 'shape-' + name;
  this.soundKey = 'selfie_spray_small';
  this.stamped = false;
  this.sizeMultiplier = 1;
  this.shapeImages = {};

  var dimensions = app.ImageManager.getImageDimensions(this.shapeName);
  this.height = dimensions.height;
  this.width = dimensions.width;
};
app.Shape.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 */
app.Shape.prototype.draw = function(canvas, mouseCoords, prevCanvas) {
  if (this.stamped) {
    return false;
  }

  var context = canvas.getContext('2d');
  var drawWidth = this.width * this.sizeMultiplier;
  var drawHeight = this.height * this.sizeMultiplier;
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var offsetX = drawWidth / 2;
  var offsetY = drawHeight / 2;
  var color = this.el.attr('data-tool-color');
  var image = app.ImageManager.getImage(this.shapeName, color);
  context.drawImage(image,
    drawX - offsetX, drawY - offsetY,
    drawWidth, drawHeight);
  this.stamped = true;

  return true;
};


/**
 * Mousedown handler
 */
app.Shape.prototype.startMousedown = function() {
  app.utils.triggerOnce(this.soundKey);
  this.el.addClass('Tool--down');
};


/**
 * Mouseup handler
 */
app.Shape.prototype.stopMousedown = function() {
  app.utils.triggerReset(this.soundKey);
  this.el.removeClass('Tool--down');
};


/**
 * Reset the shape tool
 */
app.Shape.prototype.reset = function() {
  this.stamped = false;
};


/**
 * Updates size indicator
 * @param  {!number} size  The current size setting
 */
app.Shape.prototype.updateSize = function(size) {
  this.sizeMultiplier = app.utils.map(size, app.Constants.SHAPE_MIN,
      app.Constants.SHAPE_MAX);
  this.currentSize = this.calculateDrawSize(size);
};


app.Shape.prototype.calculateDrawSize = function(size) {
  return Math.max(this.width * this.sizeMultiplier,
      this.height * this.sizeMultiplier);
};
