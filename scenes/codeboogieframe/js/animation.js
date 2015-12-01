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

goog.provide('app.Animation');

goog.require('app.AnimationData');

const canvasWidth = 622;
const canvasHeight = 494;
const fps = 24;
const framesPerSprite = 24;
const spriteScaleFactor = 0.6;
const originalWidth = 1920 * spriteScaleFactor;
const originalHeight = 1080 * spriteScaleFactor;

app.Animation = class {
  constructor(sprite, color, bpm) {
    this.name = sprite.name;

    this.frame = 0;
    this.frameCount = sprite.frames;
    this.frameDuration = 1000 / fps * (60 / bpm * 2);
    this.elapsedTime = 0;
    this.paused = true;

    sprite.duration = sprite.frames / fps;

    this.images = app.AnimationData(color);

    Object.keys(this.images).forEach(key => {
      let value = this.images[key];

      let image = new Image();
      image.src = `img/steps/${color}/${key}.png`;

      this.images[key].img = image;
    });
  }

  play() {
    this.frame = 0;
    this.paused = false;
  }

  getFrame(name, number) {
    let index = Math.floor(number / framesPerSprite);
    let data = this.images[`${name}_${index}`];

    if(!data) {
      throw new Error(`Missing data for ${name} index ${index}`)
    }

    return {
      x: (number % framesPerSprite) * data.width,
      y: 0,
      width: data.width,
      height: data.height,
      offsetX: data.offsetX - (originalWidth / 2 - canvasWidth / 2),
      offsetY: data.offsetY - (originalHeight / 2 - canvasHeight / 2),
      img: data.img
    };
  }

  update(dt) {
    if (this.paused) {
      return this.getFrame(this.name, this.frame);
    }

    this.elapsedTime += dt;

    if (this.elapsedTime > this.frameDuration) {
      let framesElapsed = Math.floor(this.elapsedTime / this.frameDuration);

      this.frame += framesElapsed;
      this.frame = this.frame % this.frameCount;

      this.elapsedTime -= framesElapsed * this.frameDuration;
    }

    return this.getFrame(this.name, this.frame);
  }
};