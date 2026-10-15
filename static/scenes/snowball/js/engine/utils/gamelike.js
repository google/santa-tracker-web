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

import { ClockSystem } from '../systems/clock-system.js';

/** @interface **/
function GamelikeInterface() {}

GamelikeInterface.prototype.setup = function() {};
GamelikeInterface.prototype.update = function() {};

/**
 * @param {*} level
 */
GamelikeInterface.prototype.setLevel = function(level) {};

Object.defineProperty(GamelikeInterface.prototype, 'level', {
  /**
   * @return {*}
   */
  get() {}
});

class DefaultBaseClass {}

export const Gamelike = (SuperClass = DefaultBaseClass) => class extends SuperClass {
  constructor() {
    super();
    this.clockSystem = new ClockSystem();

    this.currentLevel = null;
    this.ready = false;
    this.finished = false;

    this.clockSystem.startClock('gameloop', time => {
      this.preciseTick = time * 60 / 1000;
      this.tick = Math.floor(this.preciseTick);

      if (!this.ready) {
        this.setup();
        this.ready = true;
      }

      if (this.currentLevel == null || this.finished) {
        return;
      }

      this.update();
    });
  }

  /**
   * Ends the match for good. The world freezes on its last frame, which is
   * what the game over overlay is drawn on top of.
   *
   * This is deliberately one-way. A finished match that keeps simulating does
   * not just waste a frame callback: the population keeps changing underneath
   * the overlay, so whichever end-of-game condition is checked next will fire
   * a second time and overwrite the result the player is looking at.
   *
   * Restarting builds a whole new game element, so nothing here needs undoing.
   */
  finish() {
    if (this.finished) {
      return;
    }

    this.finished = true;
    this.clockSystem.stop();
  }

  setup() {}

  update() {}

  teardown() {
    this.clockSystem.teardown(this);
  }

  // NOTE(cdata): Closure compiler does not support assigning to a super
  // property yet, so this is not a setter:
  setLevel(level) {
    if (this.currentLevel != null) {
      this.currentLevel.teardown(this);
    }

    this.currentLevel = level;

    if (this.currentLevel != null) {
      this.currentLevel.setup(this);
    }
  }

  get level() {
    return this.currentLevel;
  }
};
