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

goog.provide('app.Character');

goog.require('app.Animation');
goog.require('app.Present');
goog.require('app.Step');

app.Character = class {
  /**
   * An animating character
   * @param  {Element} backEl      The back canvas container
   * @param  {Element} frontEl     The front canvas container
   * @param  {String} color        The character color
   * @param  {String} componentDir The current directory
   * @param  {number} elfOffset    Horizontal offset for the character
   */
  constructor(backEl, frontEl, color, componentDir, elfOffset) {
    this.animation = null;
    this.currentState = null;
    this.backEl = backEl;
    this.frontEl = frontEl;
    this.animations = [
      "fail_0",
      "idle_1_0",
      "idle_2_0",
      "wrap_back_blue_0",
      "wrap_back_green_0",
      "wrap_back_red_0",
      "wrap_front_blue_0",
      "wrap_front_green_0",
      "wrap_front_red_0"
    ];
    this.lastFrame = null;
    this.color = color;
    this.dir = componentDir;
    this.elfOffset = elfOffset;

    // Create canvas
    this.backCanvas = document.createElement('canvas');
    this.backCanvas.width = $('.dj--left canvas').width();
    this.backCanvas.height = canvasHeight;
    backEl.appendChild(this.backCanvas);

    this.backContext = this.backCanvas.getContext('2d');

    this.frontCanvas = document.createElement('canvas');
    this.frontCanvas.width = $('.dj--left canvas').width();
    this.frontCanvas.height = canvasHeight;
    frontEl.appendChild(this.frontCanvas);

    this.frontContext = this.frontCanvas.getContext('2d');

    this.images = {};
    this.renderSprites_(color);

    this.present = new app.Present(this);

    this.animationQueue = null;
    this.nextAnimationBeat = null;
    this.postAnimationCallback = null;
    this.offsetX = null;
  }

  /**
   * Updates the canvases on resize
   * @export
   */
  onResize() {
    this.backCanvas.width = $('.dj--left canvas').width();
    this.frontCanvas.width = $('.dj--left canvas').width();
  }

  /**
   * Loads sprites for this character
   * @param {string} color The elf color
   */
  renderSprites_(color) {
    this.animations.forEach((name) => {
      this.loadImage(name, color)
    });
  }

  /**
   * Loads an image
   * @param  {string} name  The animation name
   * @param  {string} color The elf color
   */
  loadImage(name, color) {
    let image = new Image();

    image.onload = () => {
      this.images[name] = image;
    };

    image.onerror = () => {
      image.onerror = null;
      setTimeout(() => {
        image.src += '?' + +new Date;
      }, 1000);
    }

    image.src = this.dir + `img/steps/${color}/${name}.png`;
  }

  /**
   * Updates and renders the animation
   * @param  {number} dt Milliseconds since last update
   */
  update(dt) {
    if (!this.animation) return;

    let frame = this.animation.update(dt);

    if (frame === this.lastFrame) {
      return;
    }

    this.renderFrame(frame.back, this.backContext);
    this.renderFrame(frame.front, this.frontContext);

    this.lastFrame = frame;
  }

  /**
   * Renders a frame to the character's canvases
   * @param  {Object} frame The frame data object
   * @param  {CanvasRenderingContext2D} context The canvas context
   */
  renderFrame(frame, context) {
    if (!frame) {
      context.clearRect(0, 0, context.canvas.width,
          context.canvas.height);
      return;
    }

    let image = this.images[frame.sprite];

    if (image) {
      this.offsetX = (context.canvas.width - frame.width) / 2 + this.elfOffset;
      context.clearRect(0, 0, context.canvas.width,
          context.canvas.height);

      context.drawImage(image, frame.x, frame.y,
          frame.width, frame.height, this.offsetX, frame.offsetY,
          frame.width, frame.height);
    } else {
      // Try to load failed image again.
      // Check if we are displaying the first frame so we don't try 24 times.
      if (frame.x === 0) {
        this.loadImage(frame.sprite, this.color);
      }
    }
  }

  /**
   * Play an animation
   * @param  {Object} step The animation data
   * @param  {number} bpm  Beats per minutes to play the animation at
   */
  play(step, bpm) {
    this.animation = new app.Animation(step, bpm);
    this.animation.play();
  }

  /**
   * Clean up character state
   */
  cleanUp() {
    this.animation = null;
    this.present.cleanUp();
  }
};
