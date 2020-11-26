/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('app.Penguin');

goog.require('Constants');
goog.require('Utils');

goog.require('app.AnimationManager');
goog.require('app.Slider');
goog.require('app.shared.pools');

app.Penguin = class Penguin extends app.Slider {
  constructor() {
    super();

    this.innerElem = document.createElement('div');
    this.innerElem.setAttribute('class', `penguin__inner`);
    this.elem.appendChild(this.innerElem);

    this.animations = {};

    const sides = ['front', 'back', 'side'];
    const promises = [];

    for (const side of sides) {
      const promise = new Promise(resolve => {
        app.AnimationManager.prepareAnimation(`img/penguin/${side}.json`, this.innerElem, side, (anim) => {
          this.animations[side] = anim;
          resolve();
        });
      });
      promises.push(promise);
    }

    // we have to wait the penguin animation to be loaded before rendering it once
    // after all sides are loaded, render it once
    Promise.all(promises).then(() => {
      this.render();
      if (!app.AnimationManager.penguinLoaded) {
        // penguin animation has been loaded once
        app.AnimationManager.penguinLoaded = true;
      }
    })
  }

  onInit(config) {
    super.onInit({
      ...config,
      type: 'penguin',
      checkBorder: true,
      height: Constants.PENGUIN_HEIGHT,
      width: Constants.PENGUIN_WIDTH
    });

    this.animationFrame = Constants.PENGUIN_FRAMES.start;
    this.lastAnimationFrame = null;

    this.animationDirection = this.config.isVertical ? 'front' : 'side';

    if (app.AnimationManager.penguinLoaded) {
      this.render();
    }
  }

  onDispose() {
    super.onDispose();

    if (this.animations['front']) {
      this.animations['front'].container.classList.remove('is-active');
    }

    if (this.animations['back']) {
      this.animations['back'].container.classList.remove('is-active');
    }

    if (this.animations['side']) {
      this.animations['side'].container.classList.remove('is-active');
    }

    this.innerElem.classList.remove('is-flipped');
  }

  onFrame(delta, now) {
    // update animationframe
    if (!this.lastAnimationFrame) {
      this.lastAnimationFrame = now;
    }

    const {
      nextFrame,
      frameTime
    } = Utils.nextAnimationFrame(Constants.PENGUIN_FRAMES,
        this.animationFrame, true, this.lastAnimationFrame, now);

    this.animationFrame = nextFrame;
    this.lastAnimationFrame = frameTime;

    super.onFrame();
  }

  render() {
    super.render();

    // handle direction change this frame
    if (this.flipped) {
      if (this.config.isVertical) {
        if (this.reversing) {
          this.animationDirection = 'back';
          if (this.animations['front']) {
            this.animations['front'].container.classList.remove('is-active');
          }
        } else {
          this.animationDirection = 'front';
          if (this.animations['back']) {
            this.animations['back'].container.classList.remove('is-active');
          }
        }
      } else {
        if (this.reversing) {
          this.innerElem.classList.add('is-flipped');
        } else {
          this.innerElem.classList.remove('is-flipped');
        }
      }
    }

    // render animation
    if (this.animations[this.animationDirection]) {
      this.animations[this.animationDirection].container.classList.add('is-active');
      this.animations[this.animationDirection].goToAndStop(this.animationFrame, true);
    }
  }

  // get current angle
  getDirectionAngle() {
    return Utils.getAngle(this.position, this.prevPosition);
  }

  onContact(player) {
    super.onContact(player);
    return [Constants.PLAYER_ACTIONS.BOUNCE];
  }
}

app.Penguin.targetHolderId = 'penguins';
app.Penguin.elemClass = 'penguin';

app.shared.pools.mixin(app.Penguin);
