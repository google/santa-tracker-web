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
 * @param {!HTMLCanvasElement} canvas
 * @param {string} importPath
 */
app.ClearAnimation = function(canvas) {
  this.canvas = canvas;
  this.context = /** @type {!CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  this.callback = null;
  this.animationStart_ = 0;
};


app.ClearAnimation.prototype.beginAnimation = function(callback) {
  if (this.animationStart_) {
    return;
  }

  this.callback = callback;
  this.animationStart_ = performance.now();
};


app.ClearAnimation.prototype.update = function() {
  if (!this.animationStart_) {
    return;
  }

  const canvas = this.canvas;
  const context = this.context;

  const now = (performance.now() - this.animationStart_) / 1000;  // in seconds
  if (now >= app.Constants.CLEAR_ANIMATION_SECONDS) {
    this.animationStart_ = 0;
    this.callback && this.callback();
    return;
  }

  const snowflakes = 100;
  const snowflakeRoot = ~~Math.sqrt(snowflakes);
  const animationFrac = now / app.Constants.CLEAR_ANIMATION_SECONDS;
  const adjusted = (-Math.cos(animationFrac * Math.PI) + 1) / 2;  // ease-in-out

  // mid color: #edf5f7, rgb(237, 245, 247)
  const lerpAdjust = -Math.cos(animationFrac * Math.PI / 2) + 1;  // ease-in
  const lerp = (a, b) => Math.round(a + (b - a) * lerpAdjust);
  const snowflakeColor = `rgba(${lerp(237, 255)}, ${lerp(245, 255)}, ${lerp(247, 255)})`;

  canvas.width = canvas.width;  // cheap clear (allocates new memory)
  context.save();

  for (let i = 0; i < snowflakes; ++i) {
    const row = (i % snowflakeRoot) / snowflakeRoot;
    const col = ~(i / snowflakeRoot) / snowflakeRoot;

    const x = row - 1.0 + adjusted + Math.cos(this.animationStart_ + i) / 4;
    const y = Math.sin(animationFrac * Math.PI / 2) + col;

    const radius = animationFrac * (Math.max(canvas.width, canvas.height) / 10) * (Math.cos(i) + 2);  // in real units
    const gradient = context.createRadialGradient(x * canvas.width, y * canvas.height, 0, x * canvas.width, y * canvas.height, radius);
    gradient.addColorStop(animationFrac, snowflakeColor);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x * canvas.width, y * canvas.height, radius, 0, 2 * Math.PI);
    context.fill();
  }

  context.restore();
};
