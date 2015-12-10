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

goog.require('app.Animation');
goog.require('app.AnimationData');
goog.require('app.Character');
goog.require('app.Constants');
goog.require('app.DanceStatus');
goog.require('app.I18n');
goog.require('app.Lights');
goog.require('app.MoveTiles');
goog.require('app.Step');
goog.require('app.Title');
goog.require('goog.events.EventTarget');

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

app.AnimationPlayer = class extends goog.events.EventTarget {
  /**
   * Plays character animations
   *
   * @param {Element} el for characters
   * @unrestricted
   */
  constructor(el) {
    super();

    this.player = new app.Character(
        el.querySelector('.scene__character--player'), 'purple');
    this.teacher = new app.Character(
        el.querySelector('.scene__character--teacher'), 'green');
    this.title = new app.Title(el.querySelector('.scene__word-title'));
    this.moveTiles = new app.MoveTiles(el.querySelector('.scene__moves'));
    /** @type {?app.DanceLevelResult} */
    this.lastResult = null;
    this.lights = new app.Lights(el.querySelector('.scene__lights'));
    /** @type {Array<app.AnimationItem>} */
    this.animationQueue = [];
    /** @type {?app.AnimationItem} */
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
    if (result.freestyle) {
      this.moveTiles.setLength(result.animationQueue.length - 1);
    }

    this.lastResult = result;
    this.animationQueue = result.animationQueue;
    this.moveTiles.reset();
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
      this.title.setTitle(this.lastResult && this.lastResult.endTitle);
    } else {
      this.teacher.play(animation.teacherStep, bpm);
      this.player.play(animation.playerStep, bpm);
      this.title.setTitle(animation.title, animation.isIntro,
                          animation.isCountdown ? 1 : null);
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

    if (this.currentAnimation && this.currentAnimation.isCountdown) {
      Klang.triggerEvent(`cb_count_in_${normalized}`);
    }

    let isPlaying = this.isPlaying &&
                    this.currentAnimation &&
                    !this.currentAnimation.isCountdown;

    this.lights.onBeat(beat, bpm, isPlaying);
  }

  setLevel(level) {
    this.moveTiles.setLevel(level);
    this.lights.setLevel(level);
  }
};
