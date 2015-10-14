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

goog.provide('SB.Object.MarkerLine');

goog.require('SB.Object.Renderable');

/**
 * Represents the red line over which you drive Santa and
 * Rudolf. Triggers a level up and some points.
 * @constructor
 * @struct
 * @extends SB.Object.Renderable
 */
SB.Object.MarkerLine = function() {
  SB.Object.Renderable.call(this);

  /**
   * Whether the marker line should include 3, 2, 1 numbers below itself
   * as per the start of the game.
   * @type {boolean}
   * @private
   */
  this.drawNumbers_ = true;

  /**
   * Whether the marker has been triggered. Set to true
   * when the user drives over it and reset once the
   * marker has been moved to its next position. Prevents
   * multiple hits from being registered.
   * @type {boolean}
   */
  this.triggered = false;

  this.reset();
};

SB.Object.MarkerLine.prototype = Object.create(SB.Object.Renderable.prototype);

/**
 * Draws the marker line to the canvas.
 * @param {!CanvasRenderingContext2D} ctx
 */
SB.Object.MarkerLine.prototype.render = function(ctx) {
  // line shadow
  ctx.fillStyle = "#f9c6c8";
  ctx.fillRect(2, -1, window.worldWidth - 4, 4);

  // the line
  ctx.fillStyle = "#e91c24";
  ctx.fillRect(2, -2, window.worldWidth - 4, 4);

  // the level number
  if (this.showLevel) {
    ctx.save();
    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#E5E5E5";
    ctx.font = "800 268px Lobster";
    ctx.fillText('' + this.level, this.center || window.worldWidth * 0.5, 180);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
};

/**
 * Reset the marker line.
 */
SB.Object.MarkerLine.prototype.reset = function() {
  /**
   * The number of the next level.
   * @type {number}
   */
  this.level = 1;

  /**
   * The center of the path.
   * @type {number}
   */
  this.center = window.worldWidth * 0.5;

  /**
   * Show the level number before the line?
   * @type {boolean}
   */
  this.showLevel = true;
};
