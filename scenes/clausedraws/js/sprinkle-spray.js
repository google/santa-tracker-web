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
 * Decorations that stick on the beard
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {{x: number, y: number}} offset Tool offset relative to the mouse
 * @param {!Image} decoration image.
 */
app.SprinkleSpray = function($elem, name, offset) {
  app.Tool.call(this, $elem, name, offset);

  this.soundKey = 'selfie_shave';
  this.sprinkles = [
    $elem.find('#sprinkle2')[0],
    $elem.find('#sprinkle3')[0],
    $elem.find('#sprinkle4')[0],
    $elem.find('#sprinkle5')[0]
  ];
  this.sprinkleIndex = 0;
  this.height = 100;
  this.width = 100;
  this.sprinkleOffset = {x: 50 - offset.x, y: 50 - offset.y};

  console.log('sprinkle', this);
};
app.SprinkleSpray.prototype = Object.create(app.Tool.prototype);

/**
 * [draw description]
 * @param  {[type]} context     [description]
 * @param  {[type]} mouseCoords [description]
 * @param  {[type]} scale       [description]
 * @return {[type]}             [description]
 */
app.SprinkleSpray.prototype.draw = function(context, mouseCoords) {
  var drawWidth = this.width * mouseCoords.scale;
  var drawHeight = this.height * mouseCoords.scale;
  var offsetX = this.sprinkleOffset.x * mouseCoords.scale;
  var offsetY = this.sprinkleOffset.y * mouseCoords.scale;
  context.save();
  context.translate(mouseCoords.x + offsetX, mouseCoords.y + offsetY);
  context.rotate(Math.random() * 2 * Math.PI);
  context.drawImage(this.sprinkles[this.sprinkleIndex], -offsetX, -offsetY, drawWidth, drawHeight);
  context.restore();

  this.sprinkleIndex = (this.sprinkleIndex + 1) % this.sprinkles.length;
};

