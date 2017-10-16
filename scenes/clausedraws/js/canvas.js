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
    this.backupCanvases.push({
        canvas: backup,
        empty: true
      });
  }

  // index of latest backup, increments with each save
  this.latestIndex = 0;
  // index of currently visible state, may be
  // different than latestIndex if undo was called
  this.currentIndex = this.latestIndex;
  // scale of visible canvas to original
  this.canvasRatio = 1;

  this.container = $(this.displayCanvas).closest('.Canvas');
  this.displayCtx = this.displayCanvas.getContext('2d');
  this.game_ = game;
  this.needSave = false;
  this.mouse = {
    down: false,
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    scale: 1
  };
  this.undoing = false;

  console.log($elem.find('.Tool-hairclean'),
      $elem.find('.Tool-hairdryer'));

  $elem.find('button.undo').click(this.undo.bind(this));

  $elem.find('button.redo').click(this.redo.bind(this));

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

  this.updateCanvas();
}


/**
 * Resets the canvas to original state.
 */
app.Canvas.prototype.resetCanvas = function() {
  this.clearCanvas();
  this.backupCanvases.forEach(function(canvas, index) {
    this.clearCanvas(index, true);
  }, this);

  this.latestIndex = 0;
  this.currentIndex = 0;
  this.needSave = false;
  this.mouse = {
    down: false,
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    scale: 1
  };
  this.undoing = false;
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
  var insideCanvas = this.mouse.normX >= 0 && this.mouse.normX <= 1 &&
    this.mouse.normX >= 0 && this.mouse.normX <= 1;

  if (insideCanvas && this.mouse.down && tools.selectedTool) {
    this.updateCanvas(tools.selectedTool, tools.selectedTool.draw);
  } else if ((!insideCanvas || !this.mouse.down) && tools.selectedTool) {
    tools.selectedTool.reset();

    if (this.needSave) {
      this.save();
      this.needSave = false;
    }
  }
};


/**
 * Perform actions on canvas. If no action function,
 * just recopy latest updates to display canvas
 * @param  {[type]} actionFn [description]
 * @return {[type]}          [description]
 */
app.Canvas.prototype.updateCanvas = function(actionFnContext, actionFn) {
  var drawCanvas = this.backupCanvases[this.currentIndex].canvas;

  // note: actionFn(canvas, mouse)
  if (actionFn && actionFnContext) {
    console.log('updating', this.currentIndex);
    var didDraw = actionFn.call(actionFnContext, drawCanvas, this.mouse);
    console.log('didDraw', didDraw);
    if (didDraw) {
      this.needSave = true;
    }
  }

  this.clearCanvas();
  this.displayCtx.drawImage(drawCanvas, 0, 0, this.displayCanvas.width,
      this.displayCanvas.height);
};


/**
 * Save state and move to next backup
 * @return {[type]}          [description]
 */
app.Canvas.prototype.save = function() {
  var backup = this.backupCanvases[this.currentIndex];
  var nextIndex = this.nextIndex(this.currentIndex);
  var nextCanvas = this.backupCanvases[nextIndex].canvas;
  var nextCtx = nextCanvas.getContext('2d');
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextCtx.drawImage(backup.canvas, 0, 0, nextCanvas.width,
      nextCanvas.height);
  backup.empty = false;

  if (this.currentIndex != this.latestIndex) {
    var cleared = false;
    var clearIndex = this.nextIndex(this.currentIndex);
    while (!cleared) {
      this.clearCanvas(clearIndex, true);
      if (clearIndex == this.latestIndex) {
        cleared = true;
      }
      clearIndex = this.nextIndex(clearIndex);
    }
  }

  this.undoing = false;
  this.latestIndex = nextIndex;
  this.currentIndex = this.latestIndex;
};


/**
 * Undo - go back to prev state
 * @return {[type]}          [description]
 */
app.Canvas.prototype.undo = function() {
  var previous = this.prevIndex(this.currentIndex);

  if (!this.undoing) {
    previous = this.prevIndex(previous);
    this.undoing = true;
  }

  if (previous != this.latestIndex && !this.backupCanvases[previous].empty) {
    console.log('undo to', previous, 'latest', this.latestIndex);
    this.currentIndex = previous;
    this.updateCanvas();
  }
};


/**
 * Redo - go to next state
 * @return {[type]}          [description]
 */
app.Canvas.prototype.redo = function() {
  var next = this.nextIndex(this.currentIndex);
  if (this.currentIndex != this.latestIndex &&
      !this.backupCanvases[next].empty) {
    console.log('redo to', this.nextIndex(this.currentIndex),
      'latest', this.latestIndex);
    this.currentIndex = next;
    this.updateCanvas();
  }
};


app.Canvas.prototype.prevIndex = function(index) {
  return index > 0 ? (index - 1) : this.backupCanvases.length - 1;
};


app.Canvas.prototype.nextIndex = function(index) {
  return (index + 1) % this.backupCanvases.length;
};


app.Canvas.prototype.clearCanvas = function(index, isBackup) {
  if (isBackup) {
    var backup = this.backupCanvases[index];
    var ctx = backup.canvas.getContext('2d');
    ctx.clearRect(0, 0, backup.canvas.width, backup.canvas.height);
    backup.empty = true;
  } else {
    this.displayCtx.clearRect(0, 0, this.displayCanvas.width,
        this.displayCanvas.height);
  }
};


app.Canvas.prototype.copyCanvas = function(fromIndex, toIndex) {
  var toCanvas = toIndex ?
      this.backupCanvases[toIndex].canvas : this.displayCanvas;
  var toCtx = toCanvas.getContext('2d');
  toCtx.clearRect(0, 0, toCanvas.width, toCanvas.height);
  toCtx.drawImage(this.backupCanvases[fromIndex].canvas, 0, 0, toCanvas.width,
      toCanvas.height);
}


