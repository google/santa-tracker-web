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

goog.provide('app.PenStringLights');
goog.require('app.Constants');
goog.require('app.ImageManager');
goog.require('app.PenGarland');
goog.require('app.utils');


/**
 * PenStringLights tool
 * @constructor
 * @extends {app.PenGarland}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 */
app.PenStringLights = function($elem, name, config) {
  app.PenGarland.call(this, $elem, name, config);
  this.lineColor = '#212121';
  this.lineSize = 3;
  this.soundKey = name;
  this.$image = $elem.find('#' + this.textureName + '1');
  this.image = this.$image[0];
  this.height = this.$image.height();
  this.width = this.$image.width();

  this.textures = [
    $elem.find('#' + this.textureName + '1'),
    $elem.find('#' + this.textureName + '2'),
    $elem.find('#' + this.textureName + '3'),
    $elem.find('#' + this.textureName + '4')
  ];

  this.textureIndex = 0;

  this.spacing = this.currentSize * .75;
  this.spaceUntilNext = this.spacing / 2;
  this.faceUp = true;

  this.disableColorpicker = true;
};
app.PenStringLights.prototype = Object.create(app.PenGarland.prototype);


app.PenStringLights.prototype.drawItem = function(context, texture, point,
    drawWidth, drawHeight, offsetX, offsetY ) {
  var currentTexture = this.textures[this.textureIndex];
  var width = currentTexture.width() * this.sizeFactor;
  var height = currentTexture.height() * this.sizeFactor;
  var angle = point.angle * 180 / Math.PI;
  if ((angle > 45 && angle <= 90) || (angle < -45 && angle >= -90)) {
    return;
  } else if (angle < -90) {
    angle += 180;
  } else if (angle > 90) {
    angle -= 180;
  }

  if (this.faceUp) {
    angle += 180;
  }

  context.save();
  context.translate(point.x, point.y);
  context.rotate(angle * Math.PI / 180);
  context.drawImage(currentTexture[0], -width / 2, -height * 0.1,
      width, height);
  context.restore();

  this.faceUp = !this.faceUp;
  this.textureIndex = (this.textureIndex + 1) % this.textures.length;
};


app.PenStringLights.prototype.reset = function() {
  this.points = [];
  this.spacing = this.currentSize * .75;
  this.spaceUntilNext = this.spacing / 2;
};


app.PenStringLights.prototype.getOffsets = function(drawWidth, drawHeight) {
  return {
    x: drawWidth / 2,
    y: drawHeight * 0.1
  };
};
