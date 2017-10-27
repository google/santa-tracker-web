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

goog.provide('app.SprinkleSpray');
goog.require('app.Tool');


/**
 * Spray can that sprays sprinkles
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {!string} name The name of the tool.
 */
app.SprinkleSpray = function($elem, name) {
  app.Tool.call(this, $elem, name);

  this.soundKey = 'selfie_shave';
  this.sprinkles = [
    $elem.find('#sprinkle2')[0],
    $elem.find('#sprinkle3')[0],
    $elem.find('#sprinkle4')[0],
    $elem.find('#sprinkle5')[0]
  ];
  this.sprinkleIndex = 0;
  this.sprinkleHeight = 100;
  this.sprinkleWidth = 100;
  this.sprinkleOffset = {x: 50 - this.mouseOffset.x, y: 50 - this.mouseOffset.y};
};
app.SprinkleSpray.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 */
app.SprinkleSpray.prototype.draw = function(canvas, mouseCoords) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var drawWidth = this.sprinkleWidth / mouseCoords.scale;
  var drawHeight = this.sprinkleHeight / mouseCoords.scale;
  // TODO: randomize offsets
  var offsetX = this.sprinkleOffset.x / mouseCoords.scale;
  var offsetY = this.sprinkleOffset.y / mouseCoords.scale;
  context.save();
  context.translate(drawX + offsetX, drawY + offsetY);
  context.rotate(Math.random() * 2 * Math.PI);
  context.drawImage(this.sprinkles[this.sprinkleIndex], -offsetX, -offsetY, drawWidth, drawHeight);
  context.restore();

  this.sprinkleIndex = (this.sprinkleIndex + 1) % this.sprinkles.length;
  return true;
};

