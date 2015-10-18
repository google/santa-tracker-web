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

goog.provide('SB.Object.Rudolf');

goog.require('SB.Object.Renderable');

/**
 * Represents Rudolf in the game.
 * @param {Constants.PosType} position The global position of the object.
 * @constructor
 * @struct
 * @extends SB.Object.Renderable
 */
SB.Object.Rudolf = function(position) {
  SB.Object.Renderable.call(this);
  this.position = position;

  /**
   * Rudolf's maximum velocity.
   * @type {number}
   * @const
   */
  this.MAX_VELOCITY = 15;

  /**
   * Rudolf's maximum deviation from true north, in radians.
   * @type {number}
   * @const
   */
  this.MAX_ANGLE = 0.35;

  /**
   * The sprite for rendering Rudolf
   * @type {!HTMLImageElement}
   * @const
   */
  this.IMAGE = SB.Assets.get("rudolf");

  /**
   * Rudolf's velocity.
   * @type {number}
   */
  this.velocity = 0;

};

SB.Object.Rudolf.prototype = Object.create(SB.Object.Renderable.prototype);

/**
 * Lower speed on hit.
 */
SB.Object.Rudolf.prototype.hit = function() {
  this.velocity = this.MAX_VELOCITY / 3;
};

/**
 * Clamps a value internally, e.g. rotation / velocity
 * @param {number} value The starting value.
 * @param {number} max The maximum value.
 * @param {number} min The minimum value.
 * @return {number} The value clamped to max and min.
 * @private
 */
SB.Object.Rudolf.prototype.limit_ = function(value, max, min) {
  return Math.min(max, Math.max(min, value));
};

/**
 * Updates Rudolf's target rotation.
 * @param {number} value The rotation delta, in radians.
 */
SB.Object.Rudolf.prototype.turn = function(value) {
  var amount = value -
      (value * 0.3 * (this.targetVelocity / this.MAX_VELOCITY));

  this.targetRotation += amount;
};

/**
 * Causes Rudolf to accelerate.
 * @param {number} value The velocity delta.
 */
SB.Object.Rudolf.prototype.accelerate = function(value) {
  this.targetVelocity += value;
};

/**
 * Causes Rudolf to decelerate.
 * @param {number} value The velocity delta.
 */
SB.Object.Rudolf.prototype.decelerate = function(value) {
  this.targetVelocity -= value;
};

/**
 * Updates Rudolf's velocity, rotation and position.
 */
SB.Object.Rudolf.prototype.update = function() {
  this.targetVelocity = this.limit_(this.targetVelocity,
      this.MAX_VELOCITY, 0);
  this.targetRotation = this.limit_(this.targetRotation,
      this.MAX_ANGLE, -this.MAX_ANGLE);

  var velocityMultiplier = this.velocity > this.targetVelocity ||
      this.velocity < this.MAX_VELOCITY / 3 ? 0.2 : 0.01;
  this.velocity += (this.targetVelocity - this.velocity) * velocityMultiplier;
  this.rotation += (this.targetRotation - this.rotation) * 0.2;

  this.position.x += Math.sin(this.rotation) * (this.velocity);
  this.position.y -= Math.cos(this.rotation) * (this.velocity);

  var newX = this.limit_(this.position.x, window.worldWidth - 20, 20);
  if (newX != this.position.x) {
    this.targetRotation = 0;
  }

  this.position.x = newX;

  window.santaApp.fire('sound-trigger', {
    name: 'rc_sled_speed',
    args: [(this.targetVelocity / this.MAX_VELOCITY)]
  });
};

/**
 * Draws Rudolf to the canvas context.
 * @param {!CanvasRenderingContext2D} ctx
 */
SB.Object.Rudolf.prototype.render = function(ctx) {
  ctx.fillStyle = "#FF0000";
  ctx.save();
  ctx.translate(-15, -20);
  ctx.drawImage(this.IMAGE, 0, 0);
  ctx.restore();
};
