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

goog.provide('app.Character');

goog.require('app.Animation');
goog.require('app.Step');

/**
 * @typedef {{
 *   name: string,
 *   frames: number
 * }}
 */
app.AnimationSprite;

/** @type {Object<app.Step, app.AnimationSprite>} */
let sources = {
  [app.Step.IDLE]: {
    name: 'idle',
    frames: 24
  },
  [app.Step.FAIL]: {
    name: 'fail',
    frames: 96
  },
  [app.Step.WATCH]: {
    name: 'watch',
    frames: 96
  },
  [app.Step.LEFT_ARM]: {
    name: 'pointLeft',
    frames: 96
  },
  [app.Step.RIGHT_ARM]: {
    name: 'pointRight',
    frames: 96
  },
  [app.Step.LEFT_FOOT]: {
    name: 'stepLeft',
    frames: 96
  },
  [app.Step.RIGHT_FOOT]: {
    name: 'stepRight',
    frames: 96
  },
  [app.Step.JUMP]: {
    name: 'jump',
    frames: 96
  },
  [app.Step.SHAKE]: {
    name: 'hip',
    frames: 96
  },
  [app.Step.SPLIT]: {
    name: 'splits',
    frames: 96
  },
  [app.Step.CARLTON]: {
    name: 'carlton',
    frames: 192
  },
  [app.Step.SPONGEBOB]: {
    name: 'spongebob',
    frames: 96,
  },
  [app.Step.ELVIS]: {
    name: 'elvis',
    frames: 96
  },
  [app.Step.THRILLER]: {
    name: 'thriller',
    frames: 96
  }
};

app.Character = class {
  constructor(el, color) {
    /** @type {app.Animation} */
    this.animation = null;
    this.color = color;
    this.currentState = null;
    this.el = el;
    /** @type {?app.AnimationSprite} */
    this.sprite = null;

    // Create canvas
    let canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    el.appendChild(canvas);

    this.context = canvas.getContext('2d');
  }

  update(dt) {
    if (!this.animation) return;

    let frame = this.animation.update(dt);

    this.context.canvas.width = this.context.canvas.width;
    this.context.drawImage(frame.img, frame.x, frame.y,
        frame.width, frame.height, frame.offsetX, frame.offsetY,
        frame.width, frame.height);
  }

  setState(state) {
    if (state === this.currentState) {
      return;
    }
    if (this.currentState) {
      this.el.classList.remove(this.currentState);
    }
    this.currentState = state;
    this.el.classList.add(this.currentState);
  }

  play(step, bpm) {
    this.sprite = sources[step];

    if (!this.sprite) {
      throw new Error(`No sprite found for move ${step}`);
    }

    this.animation = new app.Animation(this.sprite, this.color, bpm);

    // Hack bpm for demo
    if (step !== app.Step.IDLE) {
      this.animation.frameDuration = 1000 / fps * (60 / bpm);
    }

    this.animation.play();
  }
};
