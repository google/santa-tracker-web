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

goog.provide('app.Character');

goog.require('app.MoveQueue');
goog.require('app.Step');
goog.require('app.Title');

app.Character = class {
  constructor(el, color) {
    // Create move queue
    this.queue = new app.MoveQueue(this);

    let title = new app.Title(el);
    this.setTitle = title.setTitle.bind(title);

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

  add(moves) {
    this.queue.add(moves);
    this.setTitle('watchClosely');
  }

  play(move) {
    this.sprite = this.sprites[move.step];

    this.animation = new Animation(this.sprite);
    this.animation.play();

    this.setTitle(move.step);
  }

  onBar(bar, beat) {
    if (beat > this.lastBeatUpdate + this.sprite.duration) {
      this.queue.next();
      this.lastBeatUpdate = beat;
    }
  }
}
