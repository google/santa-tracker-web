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


/**
 * @constructor
 */
app.ClearAnimation = function($elem, canvas, backupCanvas, importPath) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.backup = backupCanvas;
  this.backupContext = backupCanvas.getContext('2d');
  this.playing = false;
  this.callback = null;
  this.ready_ = false;

  this.media_ = document.createElement('video');
  this.media_.loop = false;
  this.media_.autoplay = false;
  this.media_.muted = true;
  this.media_.src = importPath + 'img/avalanche.mp4'
  this.media_.crossOrigin = 'anonymous';

  // Mark the animation as ready when the video is ready to play.
  this.media_.addEventListener('canplaythrough', () => {
    this.ready_ = true;
  });
};


app.ClearAnimation.prototype.beginAnimation = function(callback) {
  if (this.playing) {
    return;
  }

  if (this.ready_) {
    // Don't bother playing; the video wouldn't finish.
    this.media_.play();
  }
  this.callback = callback;
  this.playing = true;
};


app.ClearAnimation.prototype.update = function(delta) {
  if (!this.playing) {
    return;
  }

  // Invoke the callback when the media ended (or if it wasn't ready at all).
  // We need to do the not-ready-check in a rAF otherwise the main scene doesn't operate properly.
  if (this.media_.ended || !this.ready_) {
    this.callback && this.callback();
    this.callback = null;
    this.playing = false;
    return;
  }

  // transparent target green color in mp4 is r=42 g=255 b=59

  this.context.drawImage(this.media_, 0, 0, this.canvas.width, this.canvas.height);

  const frame = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  const length = frame.data.length;

  for (let i = 0; i < length; i += 4) {
    const r = frame.data[i + 0];
    const g = frame.data[i + 1];
    const b = frame.data[i + 2];

    // this is how close we are to the transparent green color
    const delta = (g - (r+b)/2 - 50) * 2;  // from 0-255, more is more green

    // the closer delta is to 255, the more we want to set r/b to be closer to g
    const factor = g / ((r+b)/2);

    frame.data[i + 0] *= factor;  // r
    frame.data[i + 2] *= factor;  // b
    frame.data[i + 3] = 255 - delta;  // alpha
  }
  this.context.putImageData(frame, 0, 0);

  this.backupContext.drawImage(this.canvas, 0, 0, this.backup.width, this.backup.height);
};
