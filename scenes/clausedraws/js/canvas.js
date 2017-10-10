/*
 * Copyright 2015 Google Inc. All rights reserved.
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
 * @param {!HTMLCanvasElement} canvas A canvas to render the cloth to.
 * @constructor
 */
app.Canvas = function(game, canvas) {
  this.canvas = canvas;
  this.container = $(this.canvas).closest('.Canvas');
  this.ctx = this.canvas.getContext('2d');
  this.game_ = game;
  this.mouse = {
    down: false,
    x: 0,
    y: 0,
    px: 0,
    py: 0
  };
};


/**
 * Starts this canvas.
 */
app.Canvas.prototype.start = function() {
  this.onResize();
  $(this.canvas).on('click.clausedraws touchend.clausedraws', function() {
    // click handler
  });

  $(window).on('resize.clausedraws', this.onResize.bind(this));
};

/**
 * Resize handler
 */
app.Canvas.prototype.onResize = function() {
  this.canvasRatio = Math.min(
      this.container.height() / app.Constants.CANVAS_HEIGHT,
      this.container.width() / app.Constants.CANVAS_WIDTH);
  this.canvas.height = app.Constants.CANVAS_HEIGHT * this.canvasRatio;
  this.canvas.width = app.Constants.CANVAS_WIDTH * this.canvasRatio;
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
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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

  var rect = this.canvas.getBoundingClientRect();
  var canvasCoords = mouse.transformCoordinates(mouse.x, mouse.y, rect);

  this.mouse.px = this.mouse.x;
  this.mouse.py = this.mouse.y;

  this.mouse.x = canvasCoords.x;
  this.mouse.y = canvasCoords.y;
  this.mouse.down = canvasCoords.down;
  this.scale = this.game_.mouse.scaleFactor;

  if (this.mouse.down && tools.selectedTool) {
    tools.selectedTool.draw(this.ctx, this.mouse, this.scale);
  }

  if (tools.selectedTool && tools.selectedTool.spray && mouseCoords.down) {
    app.utils.triggerStart('selfie_color');
  } else if (!mouseCoords.down) {
    app.utils.triggerStop('selfie_color');
  }
};

/**
 * Serialize the current state of the canvas.
 * @return {string} encoded
 */
app.Canvas.prototype.save = function() {
};


/**
 * Replace the current canvas with a saved state.
 * @param {string} encoded string representing canvas state.
 */
app.Canvas.prototype.restore = function(encoded) {
};
