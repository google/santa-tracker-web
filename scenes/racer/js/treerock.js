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

goog.provide('SB.Object.TreeRock');

goog.require('SB.Object.Renderable');

/**
 * Represents the generic scenery (trees, rocks) that Santa must avoid.
 * @constructor
 * @struct
 * @extends SB.Object.Renderable
 */
SB.Object.TreeRock = function() {
  SB.Object.Renderable.call(this);

  /**
   * The sprite for the tree / rock.
   * @type {!HTMLImageElement}
   * @const
   */
  this.IMAGE = SB.Assets.get("tree");

  /**
   * The X coordinate to use for the tree / rock image. The sprite
   * contains multiple images.
   * @private
   */
  this.imageX_ = 0;

};

SB.Object.TreeRock.prototype = Object.create(SB.Object.Renderable.prototype);

/**
 * Chooses a tree or rock image from the sprite at random.
 */
SB.Object.TreeRock.prototype.chooseRender = function() {
  this.imageX_ = 0;

  if (Math.random() > 0.8) {
    this.imageX_ = Math.floor(Math.random() * 3) * 130;
  }
};

/**
 * Renders the scenery to the canvas context.
 */
SB.Object.TreeRock.prototype.render = function(ctx) {
  ctx.save();
  ctx.translate(-50, -50);
  ctx.drawImage(this.IMAGE, this.imageX_,
    0, 130, 100, 0, 0, 130, 100);
  ctx.restore();
};
