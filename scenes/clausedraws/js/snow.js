/*
 * Copyright 2017 Google Inc. All rights reserved.
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

goog.provide('app.Snow');
goog.require('app.Constants');


app.Snow = function(canvas, backupCanvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.backup = backupCanvas;
  this.backupContext = backupCanvas.getContext('2d');
  this.playing = true; // change to false
  this.cleared = true;

  this.flakes = [];
};



app.Snow.prototype.update = function(delta) {
  if (!this.playing && this.cleared) {
    return;
  }

  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.backupContext.clearRect(0, 0, this.backup.width, this.backup.height);
  this.cleared = true;

  if (this.playing) {
    if (Math.random() > 0.9) {
      this.addFlake();
      console.log('adding');
    }

    for (var i = 0; i < this.flakes.length; i++) {
      this.drawFlake(this.flakes[i]);
      this.updateFlake(this.flakes[i], delta);
    }

    this.context.drawImage(this.backup, 0, 0, this.canvas.width,
        this.canvas.height);
    this.cleared = false;
  }
};


app.Snow.prototype.addFlake = function() {
  var snowflake = {
    x: Math.random() * this.backup.width,
    y: 0,
    // vx: -0.01 + Math.random() * 0.02,
    // vy: Math.random() * 0.01,
    vx: 0.0,
    vy: 0.01,
    size: Math.random() * 10
  };

  this.flakes.push(snowflake);
};


app.Snow.prototype.updateFlake = function(flake, delta) {
  flake.x += flake.vx * delta;
  flake.y += flake.vy * delta;
};


app.Snow.prototype.drawFlake = function(flake) {
  this.backupContext.fillStyle = '#eee';
  this.backupContext.beginPath();
  this.backupContext.arc(flake.x, flake.y, flake.size, 0, 2 * Math.PI);
  this.backupContext.fill();
};
