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

goog.provide('app.ClearAnimation');
goog.require('app.Constants');
goog.require('app.utils');


app.ClearAnimation = function($elem, canvas, backupCanvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.backup = backupCanvas;
  this.backupContext = backupCanvas.getContext('2d');
  this.playing = false;
  this.cleared = true;

  this.frames = [];

  // preload frames
  // on update, if playing, draw frames
  // call update from game
};


app.ClearAnimation.prototype.beginAnimation  = function() {
};


app.ClearAnimation.prototype.reset  = function() {
  this.playing = false;
  this.flakes = [];
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.backupContext.clearRect(0, 0, this.backup.width, this.backup.height);
  this.cleared = true;
};


app.ClearAnimation.prototype.update = function(delta) {
  // TODO: connect to button,
  if (!this.playing && this.cleared) {
    return;
  }

  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.backupContext.clearRect(0, 0, this.backup.width, this.backup.height);
  this.cleared = true;

  if (this.playing) {
    if (Math.random() > 0.95 &&
        this.flakes.length < app.Constants.SNOW_MAX_PARTICLES) {
      this.addFlake();
    }

    for (var i = 0; i < this.flakes.length; i++) {
      this.drawFlake(this.flakes[i]);
      this.updateFlake(this.flakes[i], delta, i);
    }

    for (var i = this.flakes.length - 1; i >= 0; i--) {
      var flake = this.flakes[i];
      this.drawFlake(flake);
      this.updateFlake(flake, delta);

      if (flake.x > this.backup.width || flake.x < 0 ||
          flake.y > this.backup.height) {
        this.flakes.splice(i, 1);
      }
    }

    this.context.drawImage(this.backup, 0, 0, this.canvas.width,
        this.canvas.height);
    this.cleared = false;
  }
};
