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

goog.require('app.ClearAnimation');
goog.require('app.Constants');
goog.require('app.Snow');
goog.require('app.utils');
goog.require('app.shared.utils');


/**
 * Canvas manager
 * @param {!app.Game} game
 * @param {!jQuery} $elem The element
 * @constructor
 */
app.Canvas = function(game, $elem) {
  this.$elem = $elem;

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
  //sound
  this.drawingVolume = 0;
  this.lastTime = 0;
  this.lastMouseX = 0;
  this.lastMouseY = 0;
  this.hasDrawn = false;

  $elem.find('[data-tool-undo]').on('click.santascanvas touchend.santascanvas', this.undo.bind(this));

  $elem.find('[data-tool-redo]').on('click.santascanvas touchend.santascanvas', this.redo.bind(this));

  $elem.find('[data-tool-save]').on('click.santascanvas touchend.santascanvas', this.saveToFile.bind(this));

  $elem.find('[data-tool-trash]').on('click.santascanvas touchend.santascanvas', this.onTrashClick.bind(this));
};


/**
 * Starts this canvas.
 */
app.Canvas.prototype.start = function() {
  this.onResize();
  $(window).on('resize.santascanvas', this.onResize.bind(this));
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

  this.snow = new app.Snow($elem, this.foregroundCanvas, this.foregroundBackup);
  this.clearAnimation = new app.ClearAnimation(this.foregroundCanvas);
};


/**
 * Resize handler
 */
app.Canvas.prototype.onResize = function() {
  if (!this.hasDrawn) {
    this.initCanvases(this.$elem);
  }

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
  this.updateCanvas(null, null, true);

  this.clearCanvasElement(this.backgroundCanvas);
  this.clearCanvasElement(this.foregroundCanvas);
  this.clearCanvasElement(this.backgroundBackup);
  this.clearCanvasElement(this.foregroundBackup);

  this.save();
  this.needSave = false;
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
    !mouse.isInsideEl(mouse.x, mouse.y, tools.mobileEdit[0]) &&
    !mouse.isInsideEl(mouse.x, mouse.y, tools.mobileSlider[0]) &&
    !(colorpicker.isPopupOpen() &&
        mouse.isInsideEl(mouse.x, mouse.y, colorpicker.popup[0])) &&
    !mouse.isInsideEl(mouse.x, mouse.y, this.game_.rotateElem[0]);
  var startedOnSlider = $(mouse.originalTarget).closest('[data-slider]').length;
  var startedOnColorpicker = $(mouse.originalTarget).closest('[data-colorpicker]').length;

  if (insideCanvas && this.mouse.down && tools.selectedTool && !startedOnSlider && !startedOnColorpicker) {
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
app.Canvas.prototype.updateCanvas = function(actionFnContext, actionFn, isReset) {
  if (!this.hasDrawn && !isReset) {
    this.hasDrawn = true;
  }

  if ((actionFn && actionFnContext) || isReset) {
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

    if (isReset) {
      this.clearCanvas(this.drawIndex);
      this.needSave = true;
    } else {
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
    if (actionFnContext) {
      this.calculateDrawingVolume(actionFnContext.textureName);
    }
  }

  this.copyCanvasIndex(this.drawIndex);
};

app.Canvas.prototype.calculateDrawingVolume = function() {
  const now = performance.now() / 1000;

  var xPos = Math.abs(this.mouse.x / this.canvasWidth - this.lastMouseX);
  var yPos = Math.abs(this.mouse.y / this.canvasHeight - this.lastMouseY);
  var speed = Math.abs(xPos+yPos) / (now - this.lastTime);

  if (isFinite(speed)) {
    this.drawingVolume += speed / 2;
  }

  this.lastTime = now;
  this.lastMouseX = this.mouse.x / this.canvasWidth;
  this.lastMouseY = this.mouse.y / this.canvasHeight;

}
app.Canvas.prototype.soundUpdate = function() {
  if (isFinite(this.drawingVolume)) {
    this.drawingVolume *= 0.6;
    window.santaApp.fire('sound-trigger', 'cd_draw_update', Math.min(1, this.drawingVolume));
  }
}
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
    window.santaApp.fire('sound-trigger', 'cd_undo');
  }else {
    window.santaApp.fire('sound-trigger', 'cd_fail');
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
      window.santaApp.fire('sound-trigger', {name: 'cd_redo', args: [this.baseIndex]});
    }else {
      window.santaApp.fire('sound-trigger', 'cd_fail');
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
    var backup = this.backupCanvases[index];
    this.clearCanvasElement(backup.canvas);
    backup.saved = false;
  } else {
    this.displayCtx.clearRect(0, 0, this.displayCanvas.width,
        this.displayCanvas.height);
  }
};


app.Canvas.prototype.clearCanvasElement = function(canvas) {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};


/**
 * Copy canvas contents into another canvas, by index. If no toIndex is defined,
 * copies the backup at fromIndex into the display canvas.
 */
app.Canvas.prototype.copyCanvasIndex = function(fromIndex, toIndex) {
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

  window.ga('send', 'event', 'game', 'save', 'santascanvas');

  if (this.saveCanvas.msToBlob) { // for IE
    var blob = this.saveCanvas.msToBlob();
    window.navigator.msSaveBlob(blob, 'santascanvas.jpg');
    return;
  }

  var data = this.saveCanvas.toDataURL('image/jpeg');
  if (false && app.shared.utils.touchEnabled) {
    // nb. Mobile used to load another page, for some reason. But all our supported mobile browsers
    // allow for download, so remove for now.
    var windowContent = '<!DOCTYPE html>';
    windowContent += '<html>';
    windowContent += '<head><title>' + window.document.title + '</title></head>';
    windowContent += '<body style="margin: 0;">';
    windowContent += '<img style="width: 100%;" src="' + data + '">';
    windowContent += '</body>';
    windowContent += '</html>';
    var tab = window.open();
    tab.document.write(windowContent);
  } else {
    e.target.href = data;
  }
  window.santaApp.fire('sound-trigger', 'cd_save');
};


app.Canvas.prototype.onTrashClick = function(event) {
  this.snow.reset();

  window.ga('send', 'event', 'game', 'trash', 'santascanvas');

  this.clearAnimation.beginAnimation(this.resetCanvas.bind(this));

  window.santaApp.fire('sound-trigger', 'cd_trash');
};


/**
 * @typedef {{x: number, y: number, down: boolean, scale: number, normX: number,
 *          normY: number}}
 */
app.Canvas.CoordsType;
