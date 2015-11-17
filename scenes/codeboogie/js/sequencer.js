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

goog.provide('app.Sequencer');

/*
 * Temporary mock for Klang sequencer.
 */
app.Sequencer = class {
  constructor(bpm) {
    this.lastUpdateTime = 0;
    this.bar = 0;
    this.beat = 0;
    this.queue = [];
    this.beatDuration = 1000 / bpm * 60

    this.update();
  }

  update(timestamp) {
    let dt = timestamp - this.lastUpdateTime;

    if (dt > this.beatDuration) {
      this.lastUpdateTime = timestamp;

      this.beat += 1;
      this.beat = this.beat % 4;

      if (this.beat === 0) {
        this.bar += 1;
        this.onBar(this.bar);
      }

      this.onBeat(this.beat);
    }

    window.requestAnimationFrame(t => this.update(t));
  }

  add(moves) {
    moves.forEach(move => this.queue.unshift(move));
  }

  onBeat(beat) {

  }

  onBar(bar) {

  }
}
