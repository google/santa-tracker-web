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

const size = 492;
const fps = 24;
const bpm = 120;
const beatDuration = 1000 / bpm * 60;

let sources = (color) => ({
  [app.Step.IDLE]: {
    'src': `img/steps/${color}/idle.png`,
    'count': 24,
    'duration': 2
  },
  [app.Step.LEFT_ARM]: {
    'src': `img/steps/${color}/point-left.png`,
    'count': 48,
    'duration': 4
  },
  [app.Step.RIGHT_ARM]: {
    'src': `img/steps/${color}/point-right.png`,
    'count': 96,
    'duration': 8
  },
  [app.Step.LEFT_FOOT]: {
    'src': `img/steps/${color}/step-left.png`,
    'count': 96,
    'duration': 8
  },
  [app.Step.RIGHT_FOOT]: {
    'src': `img/steps/${color}/step-right.png`,
    'count': 96,
    'duration': 8
  },
  [app.Step.JUMP]: {
    'src': `img/steps/${color}/jump.png`,
    'count': 48,
    'duration': 4
  },
  [app.Step.SPIN]: {
    'src': `img/steps/${color}/hip-spin.png`,
    'count': 48,
    'duration': 4
  },
  [app.Step.SPLIT]: {
    'src': `img/steps/${color}/split.png`,
    'count': 96,
    'duration': 8
  }
})

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
      let framesElapsed = Math.floor(this.elapsedTime / this.duration);

      this.frame += framesElapsed;
      this.frame = this.frame % this.frameCount;

      this.elapsedTime -= framesElapsed * this.duration;
    }

    return this.getFrame(this.frame);
  }
}

class Character {
  constructor(el, color) {
    // Create move queue
    this.queue = new app.MoveQueue(this);

    // Create canvas
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    el.appendChild(canvas);

    this.context = canvas.getContext('2d');

    // Load sprite images
    this.sprites = sources(color);

    Object.keys(this.sprites).forEach(key => {
      this.sprites[key].img = new Image();
      this.sprites[key].img.src = this.sprites[key].src;
    });

    this.sprite = this.sprites[app.Step.IDLE];
    this.animation = new Animation(this.sprite);
  }

  update(dt) {
    let frame = this.animation.update(dt);

    this.context.canvas.width = this.context.canvas.width;
    this.context.drawImage(this.sprite.img, frame.x, frame.y, frame.width, frame.height, 0, 0, this.context.canvas.width, this.context.canvas.height);
  }

  play(move) {
    this.sprite = this.sprites[move.step];

    this.animation = new Animation(this.sprite);
    this.animation.play();
  }
}

/**
 * Plays character animations
 *
 * @param {el} container for characters
 * @constructor
 */
app.AnimationPlayer = class extends goog.events.EventTarget {
  constructor(el, scene) {
    super();
    this.scene = scene;

    this.student = new Character(el.querySelector('.scene__characters-student'), 'green');
    this.teacher = new Character(el.querySelector('.scene__characters-teacher'), 'purple');

    this.lastUpdateTime = 0;

    this.update();
  }

  update(timestamp) {
    let dt = timestamp - this.lastUpdateTime;

    this.student.update(dt);
    this.teacher.update(dt);

    this.lastUpdateTime = timestamp;

    window.requestAnimationFrame((t) => this.update(t));
  }

  play(move) {
    let step = move.step;
    let blockId = move.blockId;

    this.student.play(step);
    this.teacher.play(step);

    if (step === app.Step.IDLE) {
      if (this.playing) {
        this.dispatchEvent('finish');
      }

      this.playing = false;
    } else {
      this.playing = true;
      this.dispatchEvent({type: 'step', data: blockId});
    }
  }

  /**
   * Starts a dance routine with the specified player steps.
   *
   * @param {app.DanceLevelResult} result from player to animate.
   */
  start(result) {
    this.playing = true;

    this.student.queue.add(result.playerSteps);
    this.teacher.queue.add(this.scene.level.steps);
  }

  onBar(bar) {
    this.student.queue.next();
    this.teacher.queue.next();
  }
};
