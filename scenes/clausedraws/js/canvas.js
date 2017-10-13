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

goog.provide('app.Canvas');

goog.require('app.Constants');
goog.require('app.Point');
goog.require('app.utils');


/**
 * Canvas manager
 * @param {!app.Game} game
 * @param {!jQuery} $elem The element
 * @constructor
 */
app.Canvas = function(game, $elem) {
  this.displayCanvas = $elem.find('#draw-canvas')[0];
  this.backupCanvases = [];

  for (var i = 0; i < 5; i++) {
    var backup = $elem.find('#draw-backup' + i)[0];
    backup.height = app.Constants.CANVAS_HEIGHT;
    backup.width = app.Constants.CANVAS_WIDTH;
    this.backupCanvases.push(backup);
  }

  // index of latest backup, increments with each save
  this.latestIndex = 0;
  // index of currently visible state, may be
  // different than latestIndex if undo was called
  this.currentIndex = 0;
  // scale of visible canvas to original
  this.canvasRatio = 1;

  this.container = $(this.displayCanvas).closest('.Canvas');
  this.ctx = this.displayCanvas.getContext('2d');
  this.game_ = game;
  this.mouse = {
    down: false,
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    scale: 1
  };
};


/**
 * Starts this canvas.
 */
app.Canvas.prototype.start = function() {
  this.onResize();
  $(window).on('resize.clausedraws', this.onResize.bind(this));
};

/**
 * Resize handler
 */
app.Canvas.prototype.onResize = function() {
  this.canvasRatio = Math.min(
      this.container.height() / app.Constants.CANVAS_HEIGHT,
      this.container.width() / app.Constants.CANVAS_WIDTH);
  this.displayCanvas.height = app.Constants.CANVAS_HEIGHT * this.canvasRatio;
  this.displayCanvas.width = app.Constants.CANVAS_WIDTH * this.canvasRatio;

  // TODO: copy old canvas contents over
}

/**
 * Draws this canvas.
 */
// app.Canvas.prototype.draw = function() {
// };

/**
 * Resets the canvas to original state.
 */
app.Canvas.prototype.resetCanvas = function() {
  this.ctx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
};


/**
 * @param {!app.Mouse} mouse
 * @param {app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Canvas.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (mouse !== this.game_.mouse) {
    throw new Error('unexpected mouse callback');
  }
  var tools = this.game_.tools;

  var rect = this.displayCanvas.getBoundingClientRect();
  var canvasCoords = mouse.transformCoordinates(mouse.x, mouse.y, rect);

  this.mouse.x = canvasCoords.x;
  this.mouse.y = canvasCoords.y;
  this.mouse.down = canvasCoords.down;
  this.mouse.scale = this.canvasRatio;
  this.mouse.normX = canvasCoords.normX;
  this.mouse.normY = canvasCoords.normY;

  //TODO: check if inside canvas
  if (this.mouse.down && tools.selectedTool) {
    // tools.selectedTool.draw(this.ctx, this.mouse);
    this.updateCanvas(tools.selectedTool, tools.selectedTool.draw);
  } else if (!this.mouse.down && tools.selectedTool) {
    tools.selectedTool.reset();
  }
};


/**
 * Perform actions on canvas
 * @param  {[type]} actionFn [description]
 * @return {[type]}          [description]
 */
app.Canvas.prototype.updateCanvas = function(actionFnContext, actionFn) {
  if (!actionFn) {
    return;
  }

  // actionFn(canvas, mouse)
  var drawCanvas = this.backupCanvases[this.latestIndex];
  actionFn.call(actionFnContext, drawCanvas, this.mouse);
  this.ctx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
  this.ctx.drawImage(drawCanvas, 0, 0, this.displayCanvas.width,
      this.displayCanvas.height);
};


/**
 * Save state and move to next backup
 * @return {[type]}          [description]
 */
app.Canvas.prototype.save = function() {
};


/**
 * Undo - go back to prev state
 * @return {[type]}          [description]
 */
app.Canvas.prototype.undo = function() {
};


/**
 * Redo - go to next state
 * @return {[type]}          [description]
 */
app.Canvas.prototype.redo = function() {
};

