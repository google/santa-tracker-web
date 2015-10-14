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

goog.provide('SB.Object.Renderable');

/**
 * The base object for all renderable items in the game: santa,
 * rudolf, present, trees and rocks.
 * @constructor
 * @struct
 */
SB.Object.Renderable = function() {

  /**
   * The position of the object in world space.
   * @type {Constants.PosType}
   */
  this.position = {x: 0, y: 0};

  /**
   * The scale of the object in local space.
   * @type {Constants.PosType}
   */
  this.scale = {x: 1, y: 1};

  /**
   * The rotation of the object in local space.
   * @type {number}
   */
  this.rotation = 0;

  /**
   * The child objects of this renderable.
   * @const
   * @private
   * @type {!Array<!SB.Object.Renderable>}
   */
  this.children_ = [];

  /**
   * The current object being traversed (within children_).
   * @type {?number}
   **/
  this.c_ = null;

  // NOTE: The following properties aren't to do with Renderable, but are
  // provided for TreeRock/Present used by Scenery (as it just holds Renderable
  // instances).

  /** @type {number} */
  this.targetRotation = 0;

  /** @type {boolean} */
  this.rebound = false;

  /** @type {number} */
  this.targetVelocity = 0;

  /** @type {number} */
  this.radius = 0;

  /** @type {boolean} */
  this.active = false;
};

/**
 * Update this Renderable before rendering.
 */
SB.Object.Renderable.prototype.update = function() {
};

/**
 * Render this Renderable.
 * @param {!CanvasRenderingContext2D} ctx
 */
SB.Object.Renderable.prototype.render = function(ctx) {
};

/**
 * This Renderable was hit.
 */
SB.Object.Renderable.prototype.hit = function() {
};

/**
 * Choose a random version of this Renderable to draw, if possible (e.g., for
 * scenery).
 */
SB.Object.Renderable.prototype.chooseRender = function() {
};

/**
 * Recursive function working depth first down
 * the renderable object's children.
 * @param {!CanvasRenderingContext2D} ctx
 * @final
 */
SB.Object.Renderable.prototype.traverse = function(ctx) {
  // update the canvas
  ctx.translate(this.position.x, this.position.y);
  ctx.scale(this.scale.x, this.scale.y);
  ctx.rotate(this.rotation);

  this.update();
  this.render(ctx);

  for (this.c_ = 0; this.c_ < this.children_.length; ++this.c_) {
    var child = this.children_[this.c_];
    ctx.save();
    child.traverse(ctx);
    ctx.restore();
  }
  this.c_ = null;
};

/**
 * Adds a child object to this renderable.
 * @param {!SB.Object.Renderable} child The child to add.
 * @final
 */
SB.Object.Renderable.prototype.addChild = function(child) {
  this.children_.push(child);
};

/**
 * Removes a child object from this renderable's children.
 * @param {!SB.Object.Renderable} child The child to remove.
 * @final
 */
SB.Object.Renderable.prototype.removeChild = function(child) {
  var index = this.children_.indexOf(child);
  if (index > -1) {
    this.children_.splice(index, 1);
    if (index <= this.c_) {
      --this.c_;
    }
  }
};
