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

function imageLoader(callback) {
  let count = 0;
  let done = false;

  const work = () => {
    if (!done && --count === 0) {
      done = true;
      callback();
    }
  };
  window.setTimeout(() => {
    if (count === 0) {
      done = true;
      callback();
    }
  }, 0);

  return (url) => {
    ++count;

    const i = new Image();
    i.src = url;
    i.onload = work;
    i.onerror = work;
    return i;
  };
}

/**
 * Canvas for two moving background layers
 * @param {!Game} game The game object.
 * @param {!HTMLCanvasElement} canvas
 *
 * @constructor
 */
app.Canvas = function(game, canvas) {
  this.game_ = game;
  this.ready_ = false;

  this.canvasWidth = 2115;
  this.canvasHeight = 670;
  this.clipPositionX = 352.5;
  this.clipWidth = 1410;
  this.interval = 16.67;

  const loader = imageLoader(() =>{
    this.ready_ = true;
    this.drawDefaultImage_();
  });

  this.mountain = {};
  this.mountain.img = loader('img/bg-tile-layer1.png');
  this.mountain.width = 1490;
  this.mountain.height = 671;
  this.mountain.speed = 0.25;
  this.mountain.x = 0;

  this.trees = {};
  this.trees.img = loader('img/bg-tile-layer2.png');
  this.trees.width = 2980;
  this.trees.height = 242;
  this.trees.offsetY = 670 - 242;
  this.trees.speed = 0.5;
  this.trees.x = 0;

  /** @type {!CanvasRenderingContext2D} */
  this.ctx = canvas.getContext('2d');
};

/**
 * Draw initial frame on canvas
 */
app.Canvas.prototype.drawDefaultImage_ = function() {
  this.ctx.save();
  this.ctx.beginPath();
  this.ctx.rect(this.clipPositionX, 0, this.clipWidth, this.canvasHeight);
  this.ctx.clip();

  //draw image
  this.ctx.drawImage(this.mountain.img, this.mountain.x,
    0, this.mountain.width,this.mountain.height);
  this.ctx.drawImage(this.mountain.img, this.mountain.x+this.mountain.width,
    0, this.mountain.width,this.mountain.height);

  this.ctx.restore();

  this.ctx.drawImage(this.trees.img, this.trees.x,
    this.trees.offsetY, this.trees.width,this.trees.height);

  this.mountain.x -= this.mountain.speed;
};

/**
 * Draw function, gets called every frame by Game.
 *
 * @param {number} delta
 */
app.Canvas.prototype.onFrame = function(delta) {
  if (!this.ready_) {
    return;
  }

  // Clear Canvas
  this.ctx.clearRect(0, this.trees.offsetY, this.canvasWidth, this.trees.height);

  this.ctx.save();
  this.ctx.beginPath();
  this.ctx.rect(this.clipPositionX, 0, this.clipWidth,this.canvasHeight);
  this.ctx.clip();

  // Draw mountain layer
  if (this.mountain.x < (this.clipPositionX - this.mountain.width)) {
    this.mountain.x = this.clipPositionX;
  }
  this.ctx.drawImage(this.mountain.img, this.mountain.x,
      0, this.mountain.width,this.mountain.height);
  if (this.mountain.x < (this.clipPositionX + this.clipWidth - this.mountain.width)) {
    this.ctx.drawImage(this.mountain.img, this.mountain.x+this.mountain.width,
      0, this.mountain.width,this.mountain.height);
  } 

  this.ctx.restore();

  // Draw trees layer
  if (this.trees.x < -this.trees.width) {
    this.trees.x = 0;
  }
  this.ctx.drawImage(this.trees.img, this.trees.x,
    this.trees.offsetY, this.trees.width,this.trees.height);
  if (this.trees.x < (this.canvasWidth - this.trees.width)) {
    this.ctx.drawImage(this.trees.img, this.trees.x+this.trees.width,
      this.trees.offsetY, this.trees.width,this.trees.height);
  }

  this.mountain.x -= this.mountain.speed;
  this.trees.x -= this.trees.speed;
}