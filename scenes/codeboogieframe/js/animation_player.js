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

goog.require('app.DanceStatus');
goog.require('app.MoveQueue');
goog.require('app.Step');
goog.require('app.I18n')

const size = 492;
const fps = 24;
const bpm = 120;
const beatDuration = 1000 / bpm * 60;

let sources = (color) => ({
  [app.Step.IDLE]: {
    'src': `img/steps/${color}/idle.png`,
    'frames': 24
  },
  [app.Step.FAIL]: {
    'src': `img/steps/${color}/fail.png`,
    'frames': 96
  },
  [app.Step.WATCH]: {
    'src': `img/steps/${color}/watch.png`,
    'frames': 96
  },
  [app.Step.CARLTON]: {
    'src': `img/steps/${color}/carlton.png`,
    'frames': 192
  },
  [app.Step.LEFT_ARM]: {
    'src': `img/steps/${color}/point-left.png`,
    'frames': 48
  },
  [app.Step.RIGHT_ARM]: {
    'src': `img/steps/${color}/point-right.png`,
    'frames': 96
  },
  [app.Step.LEFT_FOOT]: {
    'src': `img/steps/${color}/step-left.png`,
    'frames': 96
  },
  [app.Step.RIGHT_FOOT]: {
    'src': `img/steps/${color}/step-right.png`,
    'frames': 96
  },
  [app.Step.JUMP]: {
    'src': `img/steps/${color}/jump.png`,
    'frames': 48
  },
  [app.Step.SPIN]: {
    'src': `img/steps/${color}/hip-spin.png`,
    'frames': 96
  },
  [app.Step.SPLIT]: {
    'src': `img/steps/${color}/split.png`,
    'frames': 96
  }
})

class Animation {
  constructor(sprite) {
    this.frame = 0;
    this.frameCount = sprite.frames;
    this.frameDuration = 1000 / fps;
    this.elapsedTime = 0;
    this.paused = true;

    sprite.duration = sprite.frames / fps;
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

    if (this.elapsedTime > this.frameDuration) {
      let framesElapsed = Math.floor(this.elapsedTime / this.frameDuration);

      this.frame += framesElapsed;
      this.frame = this.frame % this.frameCount;

      this.elapsedTime -= framesElapsed * this.frameDuration;
    }

    return this.getFrame(this.frame);
  }
}

class Character {
  constructor(el, color, setTitle) {
    // Create move queue
    this.queue = new app.MoveQueue(this, setTitle);

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

    this.lastBeatUpdate = 0;
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

  onBar(bar, beat) {
    if (beat >= this.lastBeatUpdate + this.sprite.duration) {
      this.queue.next();
      this.lastBeatUpdate = beat;
    }
  }
}

/**
 * Plays character animations
 *
 * @param {el} container for characters
 * @constructor
 */
app.AnimationPlayer = class {
  constructor(el) {
    let setTitle = (title) => {
      let translation = app.I18n.getMsg('CB_' + title)
      el.querySelector('.scene__word-title').textContent = translation
    }

    this.player = new Character(el.querySelector('.scene__characters-player'), 'green');
    this.teacher = new Character(el.querySelector('.scene__characters-teacher'), 'purple', setTitle);

    this.lastUpdateTime = 0;

    this.update();
  }

  update(timestamp) {
    let dt = timestamp - this.lastUpdateTime;

    this.player.update(dt);
    this.teacher.update(dt);

    this.lastUpdateTime = timestamp;

    window.requestAnimationFrame((t) => this.update(t));
  }

  /**
   * Starts a dance routine with the specified player steps.
   *
   * @param {app.DanceLevelResult} result from player to animate.
   */
  start(result) {
    console.log(result.danceStatus)

    let teacherSteps = result.teacherSteps.map(step => ({step}));

    switch (result.danceStatus) {
      case app.DanceStatus.NO_STEPS:
        this.teacher.queue.add(teacherSteps);
        this.player.queue.add(Array.from(result.teacherSteps, () => ({step: app.Step.WATCH})))
        break;

      case app.DanceStatus.NOT_ENOUGH_STEPS:
      case app.DanceStatus.WRONG_STEPS:
      case app.DanceStatus.TOO_MANY_STEPS:
        this.teacher.queue.add(teacherSteps);

        result.playerSteps.push({step: app.Step.FAIL});
        this.player.queue.add(result.playerSteps);
        break;

      case app.DanceStatus.SUCCESS:
        this.teacher.queue.add(teacherSteps);

        result.playerSteps.push({step: app.Step.CARLTON});
        this.player.queue.add(result.playerSteps);
        break;
    }
  }

  onBar(bar, beat) {
    this.player.onBar(bar, beat);
    this.teacher.onBar(bar, beat);
  }
};
