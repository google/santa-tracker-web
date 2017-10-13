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

goog.provide('app.Stamp');
goog.require('app.Tool');


/**
 * Decorations that stick on the beard
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the decoration
 * @param {{x: number, y: number}} offset Tool offset relative to the mouse
 * @param {!Image} decoration image.
 */
app.Stamp = function($elem, name, offset, decoration) {
  app.Tool.call(this, $elem, 'decoration--' + name, offset);

  this.decoration = decoration;
  this.soundKey = 'selfie_spray_small';
  this.stamped = false;
};
app.Stamp.prototype = Object.create(app.Tool.prototype);

app.Stamp.prototype.draw = function(canvas, mouseCoords) {
  if (this.stamped) {
    return;
  }

  var context = canvas.getContext('2d');

  var drawWidth = this.decoration.width * mouseCoords.scale;
  var drawHeight = this.decoration.height * mouseCoords.scale;
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var offsetX = this.mouseOffset.x * mouseCoords.scale;
  var offsetY = this.mouseOffset.y * mouseCoords.scale;
  context.drawImage(this.decoration,
    drawX - offsetX, drawY - offsetY,
    drawWidth, drawHeight);
  this.stamped = true;
};


app.Stamp.prototype.startSound = function() {
  app.utils.triggerOnce(this.soundKey);
}

/**
 *
 */
app.Stamp.prototype.stopSound = function() {
  app.utils.triggerReset(this.soundKey);
}

app.Stamp.prototype.reset = function() {
  this.stamped = false;
};

