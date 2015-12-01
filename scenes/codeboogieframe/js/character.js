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

'use strict';

goog.provide('app.Character');

goog.require('app.Animation');
goog.require('app.AnimationData');
goog.require('app.Step');

app.Character = class {
  constructor(el, color) {
    /** @type {app.Animation} */
    this.animation = null;
    this.currentState = null;
    this.el = el;

    // Create canvas
    let canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    el.appendChild(canvas);

    this.context = canvas.getContext('2d');

    this.images = {};
    this.renderSprites_(color);
  }

  renderSprites_(color) {
    let data = app.AnimationData(color);

    Object.keys(data).forEach(key => {
      let image = new Image();

      image.addEventListener('load', () => {
        let canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        this.images[key] = canvas;
      });

      image.src = `img/steps/${color}/${key}.png`;
    });
  }

  update(dt) {
    if (!this.animation) return;

    let frame = this.animation.update(dt);
    let image = this.images[frame.sprite];

    this.context.canvas.width = this.context.canvas.width;
    this.context.drawImage(image, frame.x, frame.y,
        frame.width, frame.height, frame.offsetX, frame.offsetY,
        frame.width, frame.height);
  }

  setState(state) {
    if (state === this.currentState) {
      return;
    }

    if (this.currentState) {
      this.el.classList.remove(this.currentState);
    }

    this.currentState = state;
    this.el.classList.add(this.currentState);
  }

  play(step, bpm) {
    this.animation = new app.Animation(step, bpm);
    this.animation.play();
  }
};
