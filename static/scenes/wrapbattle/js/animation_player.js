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

goog.provide('app.AnimationPlayer');

goog.require('app.Character');
goog.require('app.Constants');
goog.require('app.Present');

app.AnimationPlayer = class {
  /**
   * Manages the game animations based on beats
   * @param  {app.Character} leftElf   The left elf character
   * @param  {app.Character} rightElf  The right elf character
   * @param  {app.Sequencer} sequencer The sound sequencer
   */
  constructor(leftElf, rightElf, sequencer) {
    this.leftElf = leftElf;
    this.rightElf = rightElf;
    this.sequencer = sequencer;
    this.beat = -1;
    this.leftElf.animationQueue = [];
    this.rightElf.animationQueue = [];
    this.leftElf.nextAnimationBeat = 0;
    this.rightElf.nextAnimationBeat = 0;
  }

  /**
   * Checks for a new beat
   * @param {number} time The current time in seconds
   * @export
   */
  update(time) {
    let beat = Math.floor(time / (60 / this.sequencer.getBPM()));

    if (this.beat !== beat) {
      this.beat = beat;
      this.onBeat(this.leftElf);
      this.onBeat(this.rightElf);
    }
  }

  /**
   * Updates animations based on the current beat
   * @param  {app.Character} elf The character to update
   */
  onBeat(elf) {
    if (this.beat >= elf.nextAnimationBeat) {
      if (elf.postAnimationCallback) {
        elf.postAnimationCallback();
        elf.postAnimationCallback = null;
      }

      this.onAnimationBar(elf);
    }
  }

  /**
   * Updates the currently playing animation
   * @param  {app.Character} elf The character to update
   */
  onAnimationBar(elf) {
    let animation = elf.animationQueue.shift();
    if (!animation) {
      if (Math.random() < 0.5) {
        elf.play(app.Step.IDLE_1, this.sequencer.getBPM());
      } else {
        elf.play(app.Step.IDLE_2, this.sequencer.getBPM());
      }
      elf.nextAnimationBeat = this.beat + 2;
    } else {
      this.playGenericAnimation(animation);
    }
  }

  /**
   * Plays an animation
   * @param  {Object} animation The animation object
   */
  playGenericAnimation(animation) {
      let elf = animation.left ? this.leftElf : this.rightElf;
      elf.play(animation.animationName, this.sequencer.getBPM());
      elf.nextAnimationBeat = this.beat + 2;

      if (animation.startCallback) {
        animation.startCallback();
      }

      if (animation.endCallback) {
        elf.postAnimationCallback = animation.endCallback;
      }
  }

  /**
   * Adds an animation to the queue.
   * @param  {Object} animation The animation object
   * @param  {boolean} isLeft Whether the animation is for the left elf
   * @export
   */
  queueAnimation(animation, isLeft) {
    let elf = isLeft ? this.leftElf : this.rightElf;
    elf.animationQueue.push({
      animationName: animation,
      left: isLeft
    });
  }

  /**
   * Plays the present wrapping animation
   * @param  {boolean}  success  Whether the present was wrapped successfully
   * @param  {Object}  animation The animation object
   * @param  {boolean} isLeft Whether the animation is for the left elf
   * @export
   */
  playWrapAnimation(success, animation, isLeft) {
    let elf = isLeft ? this.leftElf : this.rightElf;
    if (!elf.present.playing) {
      elf.present.cleanUp();
      elf.present.init(animation.color, success);

      elf.present.showToy();
      elf.animationQueue.push({
        animationName: animation,
        left: isLeft,
        startCallback: elf.present.hideToy.bind(elf.present),
        endCallback: elf.present.showBox.bind(elf.present)
      });
    }
  }

  /**
   * Clean up animation player state
   * @export
   */
  cleanUp() {
    this.leftElf.postAnimationCallback = null;
    this.rightElf.postAnimationCallback = null;
    this.beat = -1;
    this.leftElf.animationQueue = [];
    this.rightElf.animationQueue = [];
    this.leftElf.nextAnimationBeat = 0;
    this.rightElf.nextAnimationBeat = 0;
  }
}
