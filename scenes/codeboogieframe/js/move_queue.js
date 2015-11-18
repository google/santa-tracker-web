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

goog.provide('app.MoveQueue');

goog.require('goog.events.EventTarget');

/*
 * Represents a dance routine
 */
app.MoveQueue = class extends goog.events.EventTarget {
  constructor(player, setTitle) {
    super();

    this.player = player;
    this.queue = [];
    this.setTitle = setTitle || () => {};
  }

  add(moves) {
    moves.forEach(move => this.queue.unshift(move));
    this.setTitle('watchClosely')
  }

  next() {
    if (this.queue.length > 0) {
      let move = this.queue.pop();

      if (move.step) {
        this.player.play(move);
        this.dispatchEvent({type: 'step', data: move.blockId});

        this.setTitle(move.step);
      } else {
        // Highlight loop?
        // this.dispatchEvent({type: 'step', data: move.blockId});
        this.next();
      }
    } else {
      this.player.play({step: 'idle'});
      this.dispatchEvent('finish');
    }
  }
}



