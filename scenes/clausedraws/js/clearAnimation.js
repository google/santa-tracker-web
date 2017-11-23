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

  this.frames = [];
  this.currentFrame = 0;
  this.timeUntilNextFrame = 0;

  this.preloadFrames();
};


app.ClearAnimation.prototype.preloadFrames  = function() {
  for (var i = 0; i < app.Constants.CLEAR_ANIMATION_TOTAL_FRAMES; i++) {
    var image = new Image();
    image.src = '/scenes/clausedraws/img/avalanche/avalanche_' + i + '.png';
    this.frames.push(image);
  }
};


app.ClearAnimation.prototype.beginAnimation  = function(callback) {
  if (this.playing) {
    return;
  }

  this.callback = callback;
  this.playing = true;
};


app.ClearAnimation.prototype.reset  = function() {
  this.playing = false;
  this.currentFrame = 0;
  this.timeUntilNextFrame = 0;
};


app.ClearAnimation.prototype.update = function(delta) {
  if (!this.playing) {
    return;
  }

  if (this.currentFrame >= app.Constants.CLEAR_ANIMATION_TOTAL_FRAMES) {
    this.callback();
    this.reset();
    return;
  }

  if (this.timeUntilNextFrame > delta) {
    this.timeUntilNextFrame -= delta;
  } else {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.backupContext.clearRect(0, 0, this.backup.width, this.backup.height);

    // draw frame to backupContext
    this.backupContext.drawImage(this.frames[this.currentFrame], 0, 0,
        this.backup.width, this.backup.height);

    this.context.drawImage(this.backup, 0, 0, this.canvas.width,
        this.canvas.height);

    this.timeUntilNextFrame = 33;
    this.currentFrame++;
  }
};
