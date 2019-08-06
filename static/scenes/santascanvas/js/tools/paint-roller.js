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

goog.provide('app.PaintRoller');
goog.require('app.Constants');
goog.require('app.Tool');
goog.require('app.utils');


/**
 * Paint Roller tool
 * @constructor
 * @extends {app.Tool}
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 */
app.PaintRoller = function($elem, name) {
  app.Tool.call(this, $elem, 'roller-' + name);

  this.soundKey = 'roller_' + name;
  this.drawing = false;
  this.pattern = $elem.find('#roller-' + name)[0];
  this.patternCanvas = $elem.find('#pattern-canvas')[0];
};
app.PaintRoller.prototype = Object.create(app.Tool.prototype);


/**
 * Draws this tool to the canvas.
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 * @return {boolean} Whether the canvas was changed
 */
app.PaintRoller.prototype.draw = function(canvas, mouseCoords, prevCanvas, size) {
  var context = canvas.getContext('2d');
  var drawX = mouseCoords.normX * canvas.width;
  var drawY = mouseCoords.normY * canvas.height;

  if (this.drawing) {
    var endPt = { x: drawX, y: drawY };
    var angle = app.utils.angle(this.startPt, endPt);
    var distance = app.utils.distance(this.startPt, endPt);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(prevCanvas, 0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(this.startPt.x, this.startPt.y);
    context.rotate(angle);
    context.translate(0, -this.currentSize / 2); // offset for pattern
    context.fillRect(0, 0, distance, this.currentSize);
    context.restore();
    window.santaApp.fire('sound-trigger', {name: 'cd_roller_stretch', args: [distance / Math.max(canvas.width, canvas.height)]});
  } else {
    this.startPt = { x: drawX, y: drawY };
    this.drawing = true;
    this.createPatternCanvas();
    context.fillStyle = context.createPattern(this.patternCanvas, 'repeat');
  }

  return true;
};


app.PaintRoller.prototype.createPatternCanvas = function() {
  var context = this.patternCanvas.getContext('2d');
  this.patternCanvas.height = this.currentSize;
  this.patternCanvas.width = this.pattern.width * (this.currentSize / this.pattern.height);
  context.drawImage(this.pattern, 0, 0, this.patternCanvas.width, this.patternCanvas.height);
};


/**
 * Resets the line
 */
app.PaintRoller.prototype.reset = function() {
  this.drawing = false;
};


app.PaintRoller.prototype.calculateDrawSize = function(size) {
  return app.utils.map(size, app.Constants.PAINT_ROLLER_MIN,
      app.Constants.PAINT_ROLLER_MAX);
};
