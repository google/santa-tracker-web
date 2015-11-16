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

'use strict'

goog.provide('app.AnimationPlayer');
goog.require('app.MoveQueue');
goog.require('goog.events.EventTarget');
goog.require('app.Step');

const size = 410;
const fps = 24;
const bpm = 120;
const beatDuration = 1000 / bpm * 60;

let sources = {
  [app.Step.IDLE]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/idle.png',
    'count': 24,
    'duration': 2
  },
  [app.Step.LEFT_ARM]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/step-left.png',
    'count': 96,
    'duration': 4
  },
  [app.Step.RIGHT_ARM]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/step-right.png',
    'count': 96,
    'duration': 4
  },
  [app.Step.LEFT_FOOT]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/step-left.png',
    'count': 96,
    'duration': 4
  },
  [app.Step.RIGHT_FOOT]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/step-right.png',
    'count': 96,
    'duration': 4
  },
  [app.Step.JUMP]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/jump.png',
    'count': 48,
    'duration': 4
  },
  [app.Step.SPIN]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/splits.png',
    'count': 96,
    'duration': 4
  },
  [app.Step.SPLIT]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/splits.png',
    'count': 96,
    'duration': 4
  },
  [app.Step.CLAP]: {
    'src': 'https://dl.dropboxusercontent.com/u/257321/splits.png',
    'count': 96,
    'duration': 4
  },
}

class Animation {
  constructor(sprite) {
    this.frame = 0;
    this.frameCount = sprite.count;
    this.duration = (sprite.duration * beatDuration) / sprite.count;
    this.elapsedTime = 0;
    this.paused = true;
  }

  play() {
    this.frame = 0;
    this.paused = false;
  }

  getFrame(number) {
    return {
      x: number * size,
      y: 0,
      width: size,
      height: size
    }
  }

  update(dt) {
    if (this.paused) {
      return this.getFrame(this.frame);
    }

    this.elapsedTime += dt;

    if (this.elapsedTime > this.duration) {
      this.frame += 1;
      this.frame = this.frame % this.frameCount;

      this.elapsedTime = this.elapsedTime - this.duration;

      let framesElapsed = Math.floor(this.elapsedTime / this.duration);

      if (framesElapsed > 1) {
        console.log(`${framesElapsed - 1} frames behind`);
      }
    }

    return this.getFrame(this.frame);
  }
}

/**
 * Manages queueing up dance animations.
 *
 * @param {app.Scene} scene where animations happens.
 * @constructor
 */
app.AnimationPlayer = class extends goog.events.EventTarget {
  constructor(el) {
    super();
    this.el = el;

    this.queue = new app.MoveQueue(this);

    this.sprites = sources;

    Object.keys(this.sprites).forEach(key => {
      this.sprites[key].img = new Image();
      this.sprites[key].img.src = sources[key].src;
    });

    this.sprite = this.sprites[app.Step.IDLE];
    this.sprite.img.addEventListener('load', () => this.update());

    let canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    let world = el.querySelector('.scene__world');
    world.appendChild(canvas);

    this.context = canvas.getContext('2d');

    this.animation = new Animation(this.sprite);
    this.lastUpdateTime = 0;
  }

  update(timestamp) {
    let dt = timestamp - this.lastUpdateTime;
    let frame = this.animation.update(dt);
    this.lastUpdateTime = timestamp;

    this.context.canvas.width = this.context.canvas.width;
    this.context.drawImage(this.sprite.img, frame.x, frame.y, frame.width, frame.height, 0, 0, this.context.canvas.width, this.context.canvas.height);

    window.requestAnimationFrame((t) => this.update(t));
  }

  play(move) {
    let step = move.step;
    let blockId = move.blockId;

    this.sprite = this.sprites[step];

    this.animation = new Animation(this.sprite);
    this.animation.play();

    if (step === app.Step.IDLE) {
      if (this.playing) {
        this.dispatchEvent('finish');
      }

      this.playing = false;
    } else {
      console.log(blockId)
      this.dispatchEvent({type: 'step', data: blockId});
    }
  }

  /**
   * Starts a dance routine with the specified player steps.
   * @param {app.Step[]} steps to have main player perform.
   */
  start(steps) {
    this.queue.add(steps);
  }
};
