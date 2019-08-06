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

goog.provide('app.SprayPattern');
goog.require('app.Constants');
goog.require('app.ImageManager');
goog.require('app.utils');


/**
 * Spray can that sprays sprinkles
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {!string} name The name of the tool.
 */
app.SprayPattern = function($elem, name, config) {
  app.Tool.call(this, $elem, name);

  this.soundKey = name;
  this.images = config.images || [];
  this.imageIndex = 0;
  this.currentSize = app.Constants.SPRAY_CIRCLE_SIZE;
  this.maxOffset = config.maxOffset || 0;
  this.density = config.density || 1;
  this.noRotate = config.noRotate;

  this.disableResize = true;
  this.disableColorpicker = true;

  this.populateImages($elem);
};
app.SprayPattern.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 */
app.SprayPattern.prototype.draw = function(canvas, mouseCoords) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;

  if (this.density >= 1 || Math.random() < this.density) {
    for (var i = 0; i < this.density; i++) {
      this.imageIndex = Math.floor(Math.random() * this.images.length);
      var image = this.images[this.imageIndex];
      var drawWidth = image.width;
      var drawHeight = image.height;
      var offsetX = -drawWidth / 2 + this.getRandomOffset();
      var offsetY = -drawHeight / 2 + this.getRandomOffset();

      var drawElem;
      if (image.elem) {
        drawElem = image.elem;
      } else if (image.name) {
        drawElem = app.ImageManager.getImage(image.name, image.color);
      }

      app.utils.simpleTimeout(function() {
        context.save();
        context.translate(drawX, drawY);
        if (!this.noRotate && !image.noRotate) {
          context.rotate(Math.random() * 2 * Math.PI);
        }
        context.drawImage(drawElem, offsetX, offsetY, drawWidth, drawHeight);

        context.restore();
      });
    }
  }

  return true;
};


app.SprayPattern.prototype.populateImages = function($elem) {
  for (var i = this.images.length - 1; i >= 0; i--) {
    var image = this.images[i];
    var sizeFactor = image.sizeFactor || 1;
    if (image.elemId) {
      image.elem = $elem.find('#' + image.elemId);
      image.width = image.elem.width() * sizeFactor;
      image.height = image.elem.height() * sizeFactor;
      image.elem = image.elem[0];
    } else if (image.name) {
      var dimens = app.ImageManager.getImageDimensions(image.name);
      image.width = dimens.width * sizeFactor;
      image.height = dimens.height * sizeFactor;
    }

    if (image.frequencyFactor) {
      for (var j = 0; j < image.frequencyFactor; j++) {
        this.images.push(image);
      }
    }
  }
};


app.SprayPattern.prototype.preloadImage = function() {
  for (var i = this.images.length - 1; i >= 0; i--) {
    var image = this.images[i];
    if (image.name) {
      app.ImageManager.getImage(image.name, image.color);
    }
  }
};


app.SprayPattern.prototype.getRandomOffset = function() {
  return Math.random() * this.maxOffset * 2 - this.maxOffset;
};


app.SprayPattern.prototype.calculateDrawSize = function() {
  return app.Constants.SPRAY_CIRCLE_SIZE;
};

