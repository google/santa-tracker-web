/*
 * Copyright 2016 Google Inc. All rights reserved.
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

const canvasWidth = 400;
const canvasHeight = 300;
const offsetX = 0;
const offsetY = 0;
const fps = 24;
const framesPerSprite = 24;
const spriteScaleFactor = 0.6;
const originalWidth = 1920 * spriteScaleFactor;
const originalHeight = 1080 * spriteScaleFactor;

const frameCounts = {
  [app.Step.IDLE_1.key]: 24,
  [app.Step.IDLE_2.key]: 24,
  [app.Step.FAIL.key]: 24,
  [app.Step.WRAP_BLUE.key]: 24,
  [app.Step.WRAP_GREEN.key]: 24,
  [app.Step.WRAP_RED.key]: 24
};

app.Animation = class {
  /**
   * Updates an animation
   * @param  {Object} animObj Data about the animation
   * @param  {number} bpm     Current beats per minute
   */
  constructor(animObj, bpm) {
    this.key = animObj.key;
    this.backName = animObj.back;
    this.frontName = animObj.front;
    this.frame = 0;
    this.frameCount = frameCounts[this.key];
    this.frameDuration = 1000 / fps * (60 / bpm * 2);
    this.elapsedTime = 0;
    this.paused = true;
  }

  /**
   * Start the animation from the beginning
   * @export
   */
  play() {
    this.frame = 0;
    this.paused = false;
  }

  /**
   * @param  {string} name   Name of the animation
   * @param  {number} number Frame number
   * @return {Object|undefined}   Data about the requested frame
   */
  getFrame(name, number) {
    if (!name) {
      return;
    }

    let index = Math.floor(number / framesPerSprite);
    let sprite = `${name}_${index}`;

    return {
      x: (number % framesPerSprite) * canvasWidth,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      offsetX: offsetX,
      offsetY: offsetY,
      sprite
    };
  }

  /**
   * @param  {number} dt Time change since last update call, in milliseconds
   * @return {Object} The front and back frame objects to render
   * @export
   */
  update(dt) {
    if (this.paused) {
      return {
        back: this.getFrame(this.backName, this.frame),
        front: this.getFrame(this.frontName, this.frame)
      }
    }

    this.elapsedTime += dt;

    if (this.elapsedTime > this.frameDuration) {
      let framesElapsed = Math.floor(this.elapsedTime / this.frameDuration);

      this.frame += framesElapsed;
      this.frame = Math.min(this.frame, this.frameCount - 1);

      this.elapsedTime -= framesElapsed * this.frameDuration;
    }

    return {
      back: this.getFrame(this.backName, this.frame),
      front: this.getFrame(this.frontName, this.frame)
    }
  }
};
