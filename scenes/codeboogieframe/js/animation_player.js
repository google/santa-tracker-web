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

goog.require('app.AnimationData');
goog.require('app.Constants');
goog.require('app.Character');
goog.require('app.DanceStatus');
goog.require('app.I18n');
goog.require('app.MoveTiles');
goog.require('app.Step');
goog.require('app.Title');
goog.require('goog.events.EventTarget');

const canvasWidth = 622;
const canvasHeight = 494;
const fps = 24;
const framesPerSprite = 24;
const spriteScaleFactor = 0.6;
const originalWidth = 1920 * spriteScaleFactor;
const originalHeight = 1080 * spriteScaleFactor;

/**
 * @typedef {{
 *   teacherStep: app.Step,
 *   playerStep: app.Step,
 *   title: string,
 *   blockId: string,
 *   isIntro: boolean,
 *   isCountdown: boolean
 * }}
 */
app.AnimationItem;

class Animation {
  constructor(sprite, color, bpm) {
    this.name = sprite.name;

    this.frame = 0;
    this.frameCount = sprite.frames;
    this.frameDuration = 1000 / fps * (60 / bpm * 2);
    this.elapsedTime = 0;
    this.paused = true;

    sprite.duration = sprite.frames / fps;

    this.images = app.AnimationData();

    Object.keys(this.images).forEach(key => {
      let value = this.images[key];

      let image = new Image();
      image.src = `img/steps/${color}/${key}.png`

      this.images[key].img = image
    });
  }

  play() {
    this.frame = 0;
    this.paused = false;
  }

  getFrame(name, number) {
    let index = Math.floor(number / framesPerSprite);
    let data = this.images[`${name}_${index}`];

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
        el.querySelector('.scene__character--player'), 'purple');
    this.teacher = new app.Character(
        el.querySelector('.scene__character--teacher'), 'green');
    this.title = new app.Title(el.querySelector('.scene__word-title'));
    this.moveTiles = new app.MoveTiles(el.querySelector('.scene__moves'));
    /* @type {app.AnimationItem[]} */
    this.animationQueue = [];
    /* @type {app.AnimationItem} */
    this.currentAnimation = null;

    this.lastUpdateTime = 0;
    this.isPlaying = false;
    this.bpm = 0;

    this.update(0);
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
    this.moveTiles.clear();
    this.title.setTitle(this.animationQueue[0].title, true);

    if (result.watching()) {
      this.player.setState('is-watching');
      this.teacher.setState('is-showing');
    }
  }

  /**
   * Finishes an animation
   * @private
   */
  onFinish_() {
    this.dispatchEvent({type: 'finish'});
    this.moveTiles.clear();
    this.isPlaying = false;

    this.player.setState(null);
    this.teacher.setState(null);
  }

  onMusicBar() {
    let animation = this.currentAnimation;

    if (!animation) {
      if (this.isPlaying) {
        this.onFinish_();
      }

      return;
    }

    if (animation.isCountdown) {
      this.dispatchEvent({type: 'start'});
      this.isPlaying = true;
    }

    if (animation.tile) {
      this.moveTiles.add(animation.tile);
    }

    if (animation.teacherStep !== app.Step.IDLE) {
      if (animation.playerStep === animation.teacherStep) {
        Klang.triggerEvent('cb_ingame_win');
      } else if (animation.playerStep === app.Step.FAIL) {
        Klang.triggerEvent('cb_ingame_fail');
      }
    }

    // Make sure to start counting even if we missed the previous beat.
    if (animation.isCountdown && !this.title.currentCount) {
      this.title.setTitle(animation.title, true, 2);
    }

    this.dispatchEvent({type: 'step', data: animation.blockId});
  }

  onAnimationBar(bpm) {
    let animation = this.animationQueue[0];
    if (!animation) {
      this.teacher.play(app.Step.IDLE, bpm);
      this.player.play(app.Step.IDLE, bpm);
      this.title.setTitle();
    } else {
      this.teacher.play(animation.teacherStep, bpm);
      this.player.play(animation.playerStep, bpm);
      this.title.setTitle(animation.title, animation.isIntro,
                          animation.isCountdown && 1);
    }
  }

  onBeat(beat, bpm) {
    let normalized = beat % 4 + 1;
    this.title.onBeat();

    if (normalized === 1) {
      this.currentAnimation = this.animationQueue.shift();
      this.onMusicBar();
    }

    if (normalized === 4) {
      this.onAnimationBar(bpm);
    }
  }
};
