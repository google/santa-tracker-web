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

goog.provide('app.Entity');

/**
 * Base entity class. Creates a scene graph.
 * @constructor
 */
app.Entity = function() {
  this.children = [];
  this.parent = null;

  /**
   * @type {number} absolute x position on screen.
   */
  this.screenX = 0;

  /**
   * @type {number} absolute y position on screen.
   */
  this.screenY = 0;

  /**
   * @type {number} relative x position to parent.
   */
  this.x = 0;

  /**
   * @type {number} relative y position to parent.
   */
  this.y = 0;
};

/**
 * Walks this entity and all child entities.
 * @param {function(Entity)} callback A function which processes each entity.
 */
app.Entity.prototype.walk = function(callback) {
  callback(this);
  for (var i = 0, child; child = this.children[i]; i++) {
    child.walk(callback);
  }
};

/**
 * Adds a child to this entity.
 * @param {Entity} child
 */
app.Entity.prototype.addChild = function(child) {
  child.parent = this;
  this.children.push(child);
  child.updateScreenPos_();
};

/**
 * Removes a child of this entity.
 * @param {Entity} child
 */
app.Entity.prototype.removeChild = function(child) {
  var index = this.children.indexOf(child);
  if (index >= 0) {
    this.children.splice(index, 1);
    child.parent = null;
    child.updateScreenPos_();
  }
};

/**
 * Updates the position of this entity relative to its parent.
 * @param {number} x position.
 * @param {number} y position.
 */
app.Entity.prototype.setPos = function(x, y) {
  this.x = x;
  this.y = y;
  this.updateScreenPos_();
};

/**
 * Updates the x position of this entity relative to its parent.
 * @param {number} x position.
 */
app.Entity.prototype.setX = function(x) {
  this.setPos(x, this.y);
};

/**
 * Updates the y position of this entity relative to its parent.
 * @param {number} y position.
 */
app.Entity.prototype.setY = function(y) {
  this.setPos(this.x, y);
};

/**
 * Updates the screen position recursively based on a changed parent.
 * @private
 */
app.Entity.prototype.updateScreenPos_ = function() {
  if (this.parent) {
    this.screenX = this.parent.screenX + this.x;
    this.screenY = this.parent.screenY + this.y;
  } else {
    this.screenX = this.x;
    this.screenY = this.y;
  }

  for (var i = 0, child; child = this.children[i]; i++) {
    child.updateScreenPos_();
  }
};

/**
 * Virtual method to update entity for new frame.
 */
app.Entity.prototype.onFrame = function() {};
