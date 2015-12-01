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

goog.require('app.Step');
goog.require('app.AnimationData');

const canvasWidth = 622;
const canvasHeight = 494;
const fps = 24;
const framesPerSprite = 24;
const spriteScaleFactor = 0.6;
const originalWidth = 1920 * spriteScaleFactor;
const originalHeight = 1080 * spriteScaleFactor;

const frameCounts = {
  [app.Step.IDLE]: 24,
  [app.Step.FAIL]: 48,
  [app.Step.WATCH]: 48,
  [app.Step.LEFT_ARM]: 48,
  [app.Step.RIGHT_ARM]: 48,
  [app.Step.LEFT_FOOT]: 48,
  [app.Step.RIGHT_FOOT]: 48,
  [app.Step.JUMP]: 48,
  [app.Step.SHAKE]: 48,
  [app.Step.SPLIT]: 48,
  [app.Step.CARLTON]: 96,
  [app.Step.SPONGEBOB]: 48,
  [app.Step.ELVIS]: 48,
  [app.Step.THRILLER]: 96
};

app.Animation = class {
  constructor(name, bpm) {
    this.name = name;

    this.frame = 0;
    this.frameCount = frameCounts[name];
    this.frameDuration = 1000 / fps * (60 / bpm * 2);
    this.elapsedTime = 0;
    this.paused = true;
    this.data = app.AnimationData();
  }

  play() {
    this.frame = 0;
    this.paused = false;
  }

  getFrame(name, number) {
    let index = Math.floor(number / framesPerSprite);
    let sprite = `${name}_${index}`;
    let data = this.data[sprite];

    if (!data) {
      throw new Error(`Missing data for ${sprite}`)
    }

    return {
      x: (number % framesPerSprite) * data.width,
      y: 0,
      width: data.width,
      height: data.height,
      offsetX: data.offsetX - (originalWidth / 2 - canvasWidth / 2),
      offsetY: data.offsetY - (originalHeight / 2 - canvasHeight / 2),
      sprite
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
