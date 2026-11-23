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

const { Vector2 } = self.THREE;

/**
 * Directions are expressed in the map's local space, which is what
 * `player.position` and `grid.indexToPosition` both use. In that space +Y is
 * up on screen: the map layer is tilted backwards, which would invert the
 * vertical axis, but the grid already negates Y when it converts a tile to a
 * position, and the two cancel out.
 */
const DirectionKeys = {
  ArrowUp: {x: 0, y: 1},
  ArrowDown: {x: 0, y: -1},
  ArrowLeft: {x: -1, y: 0},
  ArrowRight: {x: 1, y: 0},
  // Legacy key names, still reported by older browsers.
  Up: {x: 0, y: 1},
  Down: {x: 0, y: -1},
  Left: {x: -1, y: 0},
  Right: {x: 1, y: 0}
};

const throwKeys = new Set([' ', 'Spacebar']);

/**
 * Tracks arrow keys and the space bar for keyboard play.
 *
 * Movement reports the most recently pressed direction that is still held,
 * which is the least surprising behaviour when keys overlap during a change of
 * direction. Throwing is edge-triggered: one snowball per press, since the
 * throw itself has no cooldown and a held key would otherwise empty a powerup
 * in a handful of frames.
 */
export class KeyboardControls {
  constructor(target = self) {
    this.target = target;

    // Held direction keys, oldest first; the last entry wins.
    this.heldDirections = [];
    this.throwRequested = false;

    this.direction = new Vector2();

    this.onKeyDown = (event) => this.handleKeyDown(event);
    this.onKeyUp = (event) => this.handleKeyUp(event);
    this.onBlur = () => this.releaseAll();

    // Not passive: arrow keys and space scroll the page by default.
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    target.addEventListener('blur', this.onBlur);
  }

  /** True if the event carries a modifier, i.e. it is a browser shortcut. */
  isShortcut(event) {
    return event.ctrlKey || event.metaKey || event.altKey;
  }

  handleKeyDown(event) {
    if (this.isShortcut(event)) {
      return;
    }

    const direction = DirectionKeys[event.key];

    if (direction != null) {
      event.preventDefault();

      if (this.heldDirections.indexOf(event.key) < 0) {
        this.heldDirections.push(event.key);
      }
      return;
    }

    if (throwKeys.has(event.key) || event.code === 'Space') {
      event.preventDefault();

      // Ignore auto-repeat, so holding space doesn't throw every frame.
      if (!event.repeat) {
        this.throwRequested = true;
      }
    }
  }

  handleKeyUp(event) {
    const index = this.heldDirections.indexOf(event.key);

    if (index >= 0) {
      this.heldDirections.splice(index, 1);
    }
  }

  releaseAll() {
    this.heldDirections.length = 0;
    this.throwRequested = false;
  }

  /**
   * The direction currently being held, or null. The returned vector is reused
   * between calls, so copy it if you need to keep it.
   */
  currentDirection() {
    if (this.heldDirections.length === 0) {
      return null;
    }

    const key = this.heldDirections[this.heldDirections.length - 1];
    const direction = DirectionKeys[key];

    this.direction.set(direction.x, direction.y);

    return this.direction;
  }

  /** Returns true at most once per press of the throw key. */
  consumeThrowRequest() {
    const requested = this.throwRequested;
    this.throwRequested = false;
    return requested;
  }

  dispose() {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('blur', this.onBlur);
    this.releaseAll();
  }
}
