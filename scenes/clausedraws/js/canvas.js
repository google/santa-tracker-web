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
  this.initCanvases($elem);

  // Base state we're drawing on top of
  this.baseIndex = 0;
  // Canvas that we're drawing to
  this.drawIndex = 1;
  this.undoing = false;

  // scale of visible canvas to original
  this.canvasRatio = 1;

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

  $elem.find('[data-tool-undo]').on('click.clausedraws touchend.clausedraws', this.undo.bind(this));

  $elem.find('[data-tool-redo]').on('click.clausedraws touchend.clausedraws', this.redo.bind(this));

  $elem.find('[data-tool-save]').on('click.clausedraws touchend.clausedraws', this.saveToFile.bind(this));
};


/**
 * Starts this canvas.
 */
app.Canvas.prototype.start = function() {
  this.onResize();
  $(window).on('resize.clausedraws', this.onResize.bind(this));
};


app.Canvas.prototype.initCanvases = function($elem) {
  this.displayCanvas = $elem.find('#draw-canvas')[0];
  this.saveCanvas = $elem.find('#save-canvas')[0];
  this.backgroundCanvas = $elem.find('#back-canvas')[0];
  this.foregroundCanvas = $elem.find('#fore-canvas')[0];
  this.backgroundBackup = $elem.find('#back-backup')[0];
  this.foregroundBackup = $elem.find('#fore-backup')[0];

  this.container = $(this.displayCanvas).closest('.Canvas');
  this.displayCtx = this.displayCanvas.getContext('2d');

  // Decide whether canvas should be landscape or portrait
  if (this.container.width() / this.container.height() > 1) {
    this.canvasHeight = app.Constants.CANVAS_HEIGHT_LANDSCAPE;
    this.canvasWidth = app.Constants.CANVAS_WIDTH_LANDSCAPE;
  } else {
    this.canvasHeight = app.Constants.CANVAS_HEIGHT_PORTRAIT;
    this.canvasWidth = app.Constants.CANVAS_WIDTH_PORTRAIT;
  }

  this.saveCanvas.height = this.canvasHeight;
  this.saveCanvas.width = this.canvasWidth;
  this.backgroundBackup.height = this.canvasHeight;
  this.backgroundBackup.width = this.canvasWidth;
  this.foregroundBackup.height = this.canvasHeight;
  this.foregroundBackup.width = this.canvasWidth;

  this.backupCanvases = [];

  for (var i = 0; i < app.Constants.NUM_BACKUPS; i++) {
    var backup = $elem.find('#draw-backup' + i)[0];
    backup.height = this.canvasHeight;
    backup.width = this.canvasWidth;
    this.backupCanvases.push({
        canvas: backup,
        saved: i ? false : true
      });
  }
};


/**
 * Resize handler
 */
app.Canvas.prototype.onResize = function() {
  // check isLandscape
  this.canvasRatio = Math.min(
      this.container.height() / this.canvasHeight,
      this.container.width() / this.canvasWidth);
  var height = this.canvasHeight * this.canvasRatio;
  var width = this.canvasWidth * this.canvasRatio;
  this.displayCanvas.height = this.backgroundCanvas.height =
      this.foregroundCanvas.height = height;
  this.displayCanvas.width = this.backgroundCanvas.width =
      this.foregroundCanvas.width = width;

  if (this.needSave) {
    this.save();
  }

  this.copyCanvasIndex(this.baseIndex);
  this.copyCanvas(this.foregroundBackup, this.foregroundCanvas);
  this.copyCanvas(this.backgroundBackup, this.backgroundCanvas);
}


/**
 * Resets the canvas to original state.
 */
app.Canvas.prototype.resetCanvas = function() {
  this.clearCanvas();
  this.backupCanvases.forEach(function(canvas, index) {
    this.clearCanvas(index);
  }, this);


  this.backupCanvases[0].saved = true;
  this.baseIndex = 0;
  this.drawIndex = 1;
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
 * Mouse changed handler
 * @param {!app.Mouse} mouse
 * @param {app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Canvas.prototype.mouseChanged = function(mouse, mouseCoords) {
  if (mouse !== this.game_.mouse) {
    throw new Error('unexpected mouse callback');
  }
  var tools = this.game_.tools;
  var colorpicker = this.game_.colorpicker;

  // TODO check secondary menu bounds
  var rect = this.displayCanvas.getBoundingClientRect();
  var canvasCoords = mouse.transformCoordinates(mouse.x, mouse.y, rect);

  this.mouse.x = canvasCoords.x;
  this.mouse.y = canvasCoords.y;
  this.mouse.down = canvasCoords.down;
  this.mouse.scale = this.canvasRatio;
  this.mouse.normX = canvasCoords.normX;
  this.mouse.normY = canvasCoords.normY;
  var insideCanvas = this.mouse.normX >= 0 && this.mouse.normX <= 1 &&
    this.mouse.normY >= 0 && this.mouse.normY <= 1 &&
    !mouse.isInsideEl(mouse.x, mouse.y, tools.primaryMenu[0]) &&
    !mouse.isInsideEl(mouse.x, mouse.y, tools.secondaryMenu[0]) &&
    !(colorpicker.isPopupOpen() &&
        mouse.isInsideEl(mouse.x, mouse.y, colorpicker.popup[0]));

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
 */
app.Canvas.prototype.updateCanvas = function(actionFnContext, actionFn) {
  if (actionFn && actionFnContext) {
    if (this.undoing) {
      var cleared = false;
      var clearIndex = this.drawIndex;
      while (!cleared) {
        if (clearIndex == this.baseIndex) {
          cleared = true;
        } else {
          this.clearCanvas(clearIndex);
          clearIndex = this.prevIndex(clearIndex);
        }
      }

      this.drawIndex = this.nextIndex(this.baseIndex);
      this.copyCanvasIndex(this.baseIndex, this.drawIndex);
      this.undoing = false;
    }

    var slider = this.game_.slider;
    var colorpicker = this.game_.colorpicker;
    var drawCanvas = this.backupCanvases[this.drawIndex].canvas;
    var baseCanvas = this.backupCanvases[this.baseIndex].canvas;
    var didDraw = actionFn.call(actionFnContext, drawCanvas, this.mouse,
        baseCanvas, slider.size, colorpicker.selectedColor);
    if (didDraw) {
      this.needSave = true;
    }
  }

  // TODO check if we need to copy back and fore
  this.copyCanvasIndex(this.drawIndex);
};


/**
 * Save state and move to next backup
 */
app.Canvas.prototype.save = function() {
  this.backupCanvases[this.drawIndex].saved = true;
  this.baseIndex = this.drawIndex;
  this.drawIndex = this.nextIndex(this.baseIndex);
  this.copyCanvasIndex(this.baseIndex, this.drawIndex);
  this.backupCanvases[this.drawIndex].saved = false;
};


/**
 * Undo - go back to prev state
 */
app.Canvas.prototype.undo = function() {
  var previous = this.prevIndex(this.baseIndex);

  if (previous != this.drawIndex && this.backupCanvases[previous].saved) {
    this.baseIndex = previous;
    this.copyCanvasIndex(this.baseIndex);
  }
  this.undoing = true;
};


/**
 * Redo - go to next state
 */
app.Canvas.prototype.redo = function() {
  if (this.undoing) {
    var next = this.nextIndex(this.baseIndex);
    if (next != this.drawIndex) {
      this.baseIndex = next;
      this.copyCanvasIndex(this.baseIndex);
    }
  }
};


/**
 * Get the backup index after the given index
 * @return {number} The next index
 */

app.Canvas.prototype.prevIndex = function(index) {
  return index > 0 ? (index - 1) : this.backupCanvases.length - 1;
};


/**
 * Get the backup index before the given index
 * @return {number} The previous index
 */
app.Canvas.prototype.nextIndex = function(index) {
  return (index + 1) % this.backupCanvases.length;
};


/**
 * Clear the canvas. If no backup index is given, clears the display canvas.
 */
app.Canvas.prototype.clearCanvas = function(index) {
  if (typeof index != 'undefined') {
    // console.log('clearing', index);
    var backup = this.backupCanvases[index];
    var ctx = backup.canvas.getContext('2d');
    ctx.clearRect(0, 0, backup.canvas.width, backup.canvas.height);
    backup.saved = false;
  } else {
    this.displayCtx.clearRect(0, 0, this.displayCanvas.width,
        this.displayCanvas.height);
  }
};


/**
 * Copy canvas contents into another canvas, by index. If no toIndex is defined,
 * copies the backup at fromIndex into the display canvas.
 */
app.Canvas.prototype.copyCanvasIndex = function(fromIndex, toIndex) {
  // console.log('copying', fromIndex, 'to', toIndex, 'base', this.baseIndex, 'draw', this.drawIndex);
  var toCanvas = typeof toIndex != 'undefined' ?
      this.backupCanvases[toIndex].canvas : this.displayCanvas;
  this.copyCanvas(this.backupCanvases[fromIndex].canvas, toCanvas);
};


/**
 * Copy canvas contents into another canvas.
 */
app.Canvas.prototype.copyCanvas = function(fromCanvas, toCanvas) {
  var toCtx = toCanvas.getContext('2d');
  toCtx.clearRect(0, 0, toCanvas.width, toCanvas.height);
  toCtx.drawImage(fromCanvas, 0, 0, toCanvas.width, toCanvas.height);
};


/**
 * Save canvas as a file
 */
app.Canvas.prototype.saveToFile = function(e) {
  var saveCtx = this.saveCanvas.getContext('2d');
  saveCtx.fillStyle = "#fff";
  saveCtx.fillRect(0, 0, this.saveCanvas.width, this.saveCanvas.height);
  saveCtx.drawImage(this.backgroundBackup, 0, 0, this.saveCanvas.width,
      this.saveCanvas.height);
  saveCtx.drawImage(this.backupCanvases[this.baseIndex].canvas, 0, 0,
      this.saveCanvas.width, this.saveCanvas.height);
  saveCtx.drawImage(this.foregroundBackup, 0, 0, this.saveCanvas.width,
      this.saveCanvas.height);

  var data = this.saveCanvas.toDataURL('image/jpeg');
  e.target.href = data;
};


/**
 * @typedef {{x: number, y: number, down: boolean, scale: number, normX: number,
 *          normY: number}}
 */
app.Canvas.CoordsType;


