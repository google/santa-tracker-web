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

goog.provide('SB.Object.Text');

goog.require('SB.Object.Renderable');
goog.require('app.shared.pools');

/**
 * Represents a text to show score or time gained.
 * @constructor
 * @struct
 * @extends SB.Object.Renderable
 */
SB.Object.Text = function() {
  SB.Object.Renderable.call(this);

  /**
   * Alpha channel of the text color.
   * @type {number}
   */
  this.alpha = 0;

  /**
   * Is this text a child of the world.
   * @type {boolean}
   */
  this.inWorld = false;

  /** @type {string} */
  this.text = '';

  /** @type {number} */
  this.lastUpdateTime = 0;
};

SB.Object.Text.prototype = Object.create(SB.Object.Renderable.prototype);

SB.Object.Text.prototype.onInit = function(position, text, worldEl) {
  this.position = position;
  this.text = text;
  this.alpha = 1;
  this.active = true;
  this.lastUpdateTime = +new Date;
  if (!this.inWorld) {
    this.inWorld = true;
    worldEl.addChild(this);
  }
};

SB.Object.Text.prototype.onDispose = function() {
  this.active = false;
  this.alpha = 0;
};

/**
 * TODO(samthor): Stub method that is replaced by pools. Remove when the pools
 * code is made typesafe.
 */
SB.Object.Text.prototype.remove = function() {};

app.shared.pools.mixin(SB.Object.Text);

/**
 * Draws the present to the canvas context.
 * @param {!CanvasRenderingContext2D} ctx
 */
SB.Object.Text.prototype.render = function(ctx) {
  if (!this.active) return;

  // Calculate delta since last frame.
  var updateTime = +new Date;
  var deltaSec = Math.min(1000, updateTime - this.lastUpdateTime) / 1000;
  this.lastUpdateTime = updateTime;

  this.alpha -= 2 * deltaSec;
  if (this.alpha < 0.01) {
    this.remove();
  }

  ctx.save();
  ctx.beginPath();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0, 170, 232, ' + this.alpha + ')';
  ctx.font = '800 48px Roboto';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.fillText('+ ' + this.text, 0, -50);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
};
