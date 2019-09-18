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

goog.provide('SB.Object.Present');

goog.require('SB.Object.Renderable');

/**
 * Represents a present that Santa can pick up for extra time
 * and points.
 * @constructor
 * @struct
 * @extends SB.Object.Renderable
 */
SB.Object.Present = function() {
  SB.Object.Renderable.call(this);

  /**
   * Dimension of each present image.
   * @type {number}
   * @const
   */
  this.PRESENT_DIM = 64;

  /**
   * The sprite for the present.
   * @type {!HTMLImageElement}
   * @const
   */
  this.IMAGE = SB.Assets.get("present");

  /**
   * The X coordinate to use for the present image. The sprite
   * contains multiple images.
   * @private
   */
  this.imageX_ = 0;
};

SB.Object.Present.prototype = Object.create(SB.Object.Renderable.prototype);

/**
 * Chooses a present image from the sprite at random.
 */
SB.Object.Present.prototype.chooseRender = function() {
  this.imageX_ = Math.floor(Math.random() * 4) * this.PRESENT_DIM;
};

/**
 * Draws the present to the canvas context.
 * @param {!CanvasRenderingContext2D} ctx
 */
SB.Object.Present.prototype.render = function(ctx) {
  var dim = this.PRESENT_DIM;
  ctx.save();
  ctx.translate(-22, -17);
  ctx.drawImage(this.IMAGE, this.imageX_, 0, dim, dim, 0, 0, dim, dim);
  ctx.restore();
};
