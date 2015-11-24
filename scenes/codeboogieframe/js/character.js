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

goog.require('app.Step');

let sources = {
  [app.Step.IDLE]: {
    'name': 'idle',
    'frames': 24
  },
  [app.Step.FAIL]: {
    'name': `fail`,
    'frames': 96
  },
  [app.Step.WATCH]: {
    'name': `watch`,
    'frames': 96
  },
  [app.Step.CARLTON]: {
    'name': `carlton`,
    'frames': 192
  },
  [app.Step.LEFT_ARM]: {
    'name': `pointLeft`,
    'frames': 96
  },
  [app.Step.RIGHT_ARM]: {
    'name': `pointRight`,
    'frames': 96
  },
  [app.Step.LEFT_FOOT]: {
    'name': `stepLeft`,
    'frames': 96
  },
  [app.Step.RIGHT_FOOT]: {
    'name': `stepRight`,
    'frames': 96
  },
  [app.Step.JUMP]: {
    'name': `jump`,
    'frames': 96
  },
  [app.Step.SPIN]: {
    'name': `spin`,
    'frames': 96
  },
  [app.Step.SPLIT]: {
    'src': `split`,
    'frames': 96
  }
};

app.Character = class Character {
  constructor(el, color) {
    this.color = color

    // Create canvas
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    el.appendChild(canvas);

    this.context = canvas.getContext('2d');

    this.sprite = sources[app.Step.IDLE];
    this.animation = new Animation(this.sprite, this.color);
  }

  update(dt) {
    let frame = this.animation.update(dt);

    this.context.canvas.width = this.context.canvas.width;
    this.context.drawImage(frame.img, frame.x, frame.y,
        frame.width, frame.height, frame.offsetX, frame.offsetY,
        frame.width, frame.height);
  }

  play(step) {
    this.sprite = sources[step];

    this.animation = new Animation(this.sprite, this.color);
    this.animation.play();
  }
};
