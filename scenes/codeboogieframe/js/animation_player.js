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

goog.provide('app.AnimationPlayer');
goog.provide('app.AnimationItem');

goog.require('app.Constants');
goog.require('app.Character');
goog.require('app.DanceStatus');
goog.require('app.I18n');
goog.require('app.Step');
goog.require('app.Title');
goog.require('goog.events.EventTarget');

const size = 492;
const fps = 24;
const bpm = 120;
const beatDuration = 1000 / bpm * 60;

/**
 * @typedef {{
 *   teacherStep: app.Step,
 *   playerStep: app.Step,
 *   title: string,
 *   blockId: string,
 *   showCount: boolean
 * }}
 */
app.AnimationItem;

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
});

class Animation {
  constructor(sprite) {
    this.frame = 0;
    this.frameCount = sprite.frames;
    this.frameDuration = 1000 / fps * (60 / bpm * 2);
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
    };
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

/**
 * Plays character animations
 *
 * @param {el} container for characters
 * @constructor
 */
app.AnimationPlayer = class extends goog.events.EventTarget {
  constructor(el) {
    super();

    this.player = new app.Character(
        el.querySelector('.scene__characters-player'), 'green');
    this.teacher = new app.Character(
        el.querySelector('.scene__characters-teacher'), 'purple');
    this.title = new app.Title(el.querySelector('.scene__word-title'));
    /* @type {app.AnimationItem[]} */
    this.animationQueue = [];

    this.lastUpdateTime = 0;
    this.lastBeat = 0;

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
    this.animationQueue = result.animationQueue;
  }

  onBar(bar, beat) {
    if (beat < this.lastBeat + app.Constants.BEATS_PER_ANIMATION) {
      return;
    }

    this.lastBeat = beat;
    let animation = this.animationQueue.shift();
    if (!animation) {
      this.teacher.play(app.Step.IDLE);
      this.player.play(app.Step.IDLE);
      this.dispatchEvent({type: 'finish'});
      return;
    }

    this.teacher.play(animation.teacherStep);
    this.player.play(animation.playerStep);
    this.title.setTitle(animation.title);
    this.dispatchEvent({type: 'step', data: animation.blockId});
  }
};
