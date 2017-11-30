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

goog.provide('app.Sticker');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * Sticker tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the sticker
 */
app.Sticker = function($elem, name, addlMultiplier) {
  app.Tool.call(this, $elem, 'sticker-' + name);

  this.stickerName = 'sticker-' + name;
  this.sticker = $elem.find('#' + this.stickerName)[0];
  this.soundKey = 'cd_sticker_place';
  this.stamped = false;
  this.sizeMultiplier = 1;
  this.addlMultiplier = addlMultiplier || 1;

  this.hoverPreviewEl = $elem.find('.Tool-hover-preview--default');
  this.currentAngle = 0;
};
app.Sticker.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 */
app.Sticker.prototype.draw = function(canvas, mouseCoords, prevCanvas) {
  if (this.stamped) {
    return false;
  }

  var context = canvas.getContext('2d');
  var drawWidth = this.sticker.width * this.sizeMultiplier;
  var drawHeight = this.sticker.height * this.sizeMultiplier;
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;
  var offsetX = drawWidth / 2;
  var offsetY = drawHeight / 2;
  var rad = this.currentAngle * Math.PI / 180;

  context.save();
  context.translate(drawX, drawY);
  context.rotate(rad);
  context.drawImage(this.sticker, -offsetX, -offsetY, drawWidth, drawHeight);
  context.restore();
  this.stamped = true;

  return true;
};


/**
 * Mousedown handler
 */
app.Sticker.prototype.startMousedown = function() {
  app.utils.triggerOnce(this.soundKey);
  this.el.addClass('Tool--down');
};


/**
 * Mouseup handler
 */
app.Sticker.prototype.stopMousedown = function() {
  app.utils.triggerReset(this.soundKey);
  this.el.removeClass('Tool--down');
};


/**
 * Reset the shape tool
 */
app.Sticker.prototype.reset = function() {
  this.stamped = false;
};


/**
 * Updates size indicator
 * @param  {!number} size  The current size setting
 */
app.Sticker.prototype.updateSize = function(size) {
  this.sizeMultiplier = app.utils.map(size, app.Constants.STICKER_MIN,
      app.Constants.STICKER_MAX) * this.addlMultiplier;
  this.currentSize = this.calculateDrawSize(size);
};


app.Sticker.prototype.calculateDrawSize = function(size) {
  return Math.max(this.sticker.width * this.sizeMultiplier,
      this.sticker.height * this.sizeMultiplier);
};


app.Sticker.prototype.updateAngle = function(angle) {
  this.currentAngle += angle;
  this.hoverPreviewEl.css({
    transform: 'translate(-50%, -50%) rotate(' + this.currentAngle + 'deg)'
  });
};
