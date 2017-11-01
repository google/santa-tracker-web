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

goog.provide('app.Spray');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * Spray can that sprays sprinkles
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {!string} name The name of the tool.
 */
app.Spray = function($elem, name) {
  app.Tool.call(this, $elem, name);

  this.sprayImage = $elem.find('#spray--yellow')[0];

  this.soundKey = 'selfie_shave';
};
app.Spray.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 */
app.Spray.prototype.draw = function(canvas, mouseCoords) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var drawWidth = this.currentSize;
  var drawHeight = this.currentSize;
  var offsetX = drawWidth / 2;
  var offsetY = drawHeight / 2;
  context.drawImage(this.sprayImage, drawX - offsetX, drawY - offsetY,
      drawWidth, drawHeight);
  return true;
};


app.Spray.prototype.calculateDrawSize = function(size) {
  return app.utils.map(size, app.Constants.SPRAY_MIN,
      app.Constants.SPRAY_MAX);
};

