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

goog.provide('SB.Object.Santa');

goog.require('SB.Object.Renderable');

/**
 * Represents Santa in the game.
 * @param {Constants.PosType} position The global position of santa.
 * @constructor
 * @struct
 * @extends SB.Object.Renderable
 */
SB.Object.Santa = function(position) {
  SB.Object.Renderable.call(this);
  this.position = position;
  this.radius = 25;

  /**
   * The sprite for rendering Rudolf.
   * @type {!HTMLImageElement}
   * @const
   */
  this.IMAGE = SB.Assets.get("santa");

  /**
   * Santa's acceleration.
   * @type {Constants.PosType}
   */
  this.acceleration = {x: 0, y: 0};

  /**
   * Santa's velocity.
   * @type {Constants.PosType}
   */
  this.velocity = {x: 0, y: 0};

  /**
   * The base length of the notional spring connecting
   * Santa's sled to Rudolf.
   * @type {number}
   */
  this.baseExtension = 0;

  /**
   * The current extension of the notional spring connecting
   * Santa's sled to Rudolf.
   * @type {number}
   */
  this.extension = 0;

  /**
   * Our Rudolf.
   * @type {SB.Object.Rudolf}
   */
  this.rudolf_ = null;
};

SB.Object.Santa.prototype = Object.create(SB.Object.Renderable.prototype);

/**
 * The sound to play when Rudolf has a collision.
 */
SB.Object.Santa.prototype.hit = function() {
  window.santaApp.fire('sound-trigger', "rc_player_crash");
};

/**
 * Updates Santa's acceleration, velocity and position.
 */
SB.Object.Santa.prototype.update = function() {

  // calculate the force being exerted,
  // which should be the extension on the reins
  var distX = this.rudolf_.position.x - this.position.x;
  var distY = this.rudolf_.position.y - this.position.y;
  var extension = Math.sqrt(distX * distX + distY * distY) -
    this.baseExtension;

  var force = Math.max(0, extension) * 0.02;
  var forceAngle = Math.atan2(distY, distX);

  var forceX = Math.cos(forceAngle) * force;
  var forceY = Math.sin(forceAngle) * force;

  // use Euler integration to get a new position
  this.acceleration.x = forceX;
  this.acceleration.y = forceY;

  this.velocity.x += this.acceleration.x;
  this.velocity.y += this.acceleration.y;

  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  this.velocity.x *= 0.93;
  this.velocity.y *= 0.93;

  this.rotation = forceAngle + (Math.PI * 0.5);

  this.extension = extension;
};

/**
 * Renders Santa to the canvas context
 * @param {!CanvasRenderingContext2D} ctx
 */
SB.Object.Santa.prototype.render = function(ctx) {
  var rudolfRotationX = Math.sin(this.rudolf_.rotation) * 6;
  var rudolfRotationY = Math.cos(this.rudolf_.rotation) * 6;

  ctx.save();
  ctx.translate(-23, -35);
  ctx.drawImage(this.IMAGE, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.rotate(-this.rotation);
  ctx.strokeStyle = "#411405";
  ctx.lineWidth = 1.0;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // left rein
  ctx.beginPath();

  var startX = -6, startY = -4,
    endX = this.rudolf_.position.x - this.position.x - 6,
    endY = this.rudolf_.position.y - this.position.y,
    curve = Math.min(
      7,
      Math.max(0, 7 - (this.extension * 0.1))
    );

  endX -= rudolfRotationX;
  endY += rudolfRotationY;

  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(
    startX + ((endX - startX) * 0.5) + curve,
    startY + ((endY - startY) * 0.5),
    endX, endY
  );
  ctx.stroke();
  ctx.closePath();

  // right rein
  ctx.beginPath();

  startX = 6;
  endX = this.rudolf_.position.x - this.position.x + 6;
  endX -= rudolfRotationX;

  ctx.moveTo(startX, startY);

  ctx.quadraticCurveTo(
    startX + ((endX - startX) * 0.5) - curve,
    startY + ((endY - startY) * 0.5),
    endX, endY
  );

  ctx.stroke();
  ctx.closePath();
  ctx.restore();

};

/**
 * Stores a reference to the rudolf instance for convenience.
 * @param {SB.Object.Rudolf} rudolf The instance of Rudolf.
 */
SB.Object.Santa.prototype.connectTo = function(rudolf) {
  this.rudolf_ = rudolf;
  this.baseExtension = this.position.y - this.rudolf_.position.y;
};
