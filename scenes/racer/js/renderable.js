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
 * @param {object} position The global position of the object.
 * @param {number} rotation The local rotation of the object.
 * @param {object} scale The local scale of the object.
 * @constructor
 */
SB.Object.Renderable = function(position, rotation, scale) {

  /**
   * The position of the object in world space.
   * @type {object}
   */
  this.position = position || {x: 0, y: 0};

  /**
   * The scale of the object in local space.
   * @type {object}
   */
  this.scale = scale || {x: 1, y: 1};

  /**
   * The rotation of the object in local space.
   * @type {number}
   */
  this.rotation = rotation || 0;

  /**
   * The child objects of this renderable.
   * @type {Array.<SB.Object.Renderable>}
   */
  this.children = [];

  /**
   * A cached count of the children.
   * @type {number}
   * @private
   */
  this.childCount_ = 0;

  /**
   * A cached index for a children iterator.
   * @type {number}
   * @private
   */
  this.c_ = 0;
};

/**
 * Recursive function working depth first down
 * the renderable object's children.
 * @param {!CanvasRenderingContext2D} ctx
 */
SB.Object.Renderable.prototype.traverse = function(ctx) {
  // update the canvas
  ctx.translate(this.position.x, this.position.y);
  ctx.scale(this.scale.x, this.scale.y);
  ctx.rotate(this.rotation);

  // run the renderable's update if
  // it has one
  if (typeof this.update !== "undefined") {
    this.update();
  }

  // same for the render
  if (typeof this.render !== "undefined") {
    this.render(ctx);
  }

  // reset the child counter
  this.c_ = 0;

  // now recursively traverse the children objects
  while (this.c_ < this.childCount_) {
    ctx.save();
    this.children[this.c_++].traverse(ctx);
    ctx.restore();
  }
};

/**
 * Adds a child object to this renderable.
 * @param {SB.Object.Renderable} child The child to add.
 */
SB.Object.Renderable.prototype.addChild = function(child) {
  this.children.push(child);
  this.childCount_++;
};

/**
 * Removes a child object from this renderable's children.
 * @param {SB.Object.Renderable} child The child to remove.
 */
SB.Object.Renderable.prototype.removeChild = function(child) {
  var index = this.children.indexOf(child);
  if (index > -1) {
    this.children.splice(index, 1);
    this.childCount_--;
  }
};
