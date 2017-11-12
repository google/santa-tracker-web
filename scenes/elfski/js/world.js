/*
 * Copyright 2017 Google Inc. All rights reserved.
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

import noise from './noise.js';
import * as vec from './vec.js';
import * as ents from './ents.js';
import {clamp} from './util.js';

const cellSize = 48;
const startAtCell = 6;
const treeNoiseThreshold = -0.1;
const treeCount = 4;  // number of trees in sprite
const crashThreshold = 12;  // px from tree base to crash

const pathWeight = 800;
const pathLength = 2 << 15;  // until here
const dotEvery = 120;  // with a dot this many px

export class WorldManager {

  /**
   * @param {!ents.SantaRender} render
   */
  constructor(render) {
    /** @private {!Set<string>} */
    this._decorated = new Set();

    /** @private {!ents.SantaRender} */
    this._render = render;

    /** @private {number} */
    this._pathsTo = dotEvery;

    /** @private {!Array<{ent: ents.SpriteEnt, type: string}>} */
    this._items = [];
  }

  /**
   * Resets the world.
   */
  reset() {
    this._items.forEach((item) => item.ent.free());
    this._items = [];
    this._pathsTo = dotEvery;
    this._decorated = new Set();
  }

  /**
   * @param {vec.Vector} transform
   * @param {{width: number, height: number}} canvas
   */
  decorate(transform, canvas) {
    // remove offscreen (up) ents
    const threshold = (-transform.y - canvas.height / 2);
    while (this._items.length) {
      const next = this._items[0];
      if (next.ent.at.y > threshold) {
        break;  // don't remove anymore
      }
      next.ent.free();
      this._items.shift();
    }

    const x = ~~((-transform.x - canvas.width / 2) / cellSize) - 1;
    const y = Math.max(startAtCell, ~~((-transform.y - canvas.height / 2) / cellSize));  // only ever decorate below us
    const w = Math.ceil(canvas.width / cellSize) + 2;
    const h = Math.ceil(canvas.height / cellSize) + 4;  // nb. more than tree height to avoid pop

    // nb. operate on y first, as we clear from top-down
    for (let j = y; j < y + h; ++j) {
      for (let i = x; i < x + w; ++i) {
        const key = `${i},${j}`;
        if (this._decorated.has(key)) {
          continue;
        }
        this._decorated.add(key);
        this._decorateCell(i, j);
      }
    }

    // add easy/hard paths
    const pathTarget = Math.min(-transform.y + canvas.width / 2, pathLength);
    while (this._pathsTo < pathTarget) {
      this._pathsTo += dotEvery;
      let index = (this._pathsTo % (dotEvery * 2)) ? 1 : 0;

      // hard has a single pole, and it's half as often
      if (!index) {
        const hardRange = this._pathRange(true, this._pathsTo);
        const at = {x: hardRange.at, y: this._pathsTo};
        const def = {spriteIndex: 7, offset: 16, layer: 1};
        const ent = this._render.newSprite(def, at);
        this._items.push({ent, type: 'tree'});  // functionally a tree that can be hit
      }

      // easy has l/r dots (40% in from edge)
      const easyRange = this._pathRange(false, this._pathsTo);
      [-0.3, +0.3].forEach((mod) => {
        ++index;
        const at = {x: easyRange.at + (mod * easyRange.width), y: this._pathsTo};
        const def = {spriteIndex: (4 + index % 2), offset: 16, layer: 0};
        const ent = this._render.newSprite(def, at);
        this._items.push({ent, type: 'dot'});
      });
    }
  }

  /**
   * @param {boolean} isHard
   * @param {number} y
   * @return {{at: number, width: number}}
   */
  _pathRange(isHard, y) {
    let x = Math.cos(y / 255) * 20;;
    let width = 280;

    if (isHard) {
      x += Math.sin(y / dotEvery * 2) * 50;
      width = 200;
    } else {
      x += Math.sin(y / dotEvery * 100) * 20;
    }
    width += ((width / 2) * noise(0, y / 562.2));

    let baseAt = Math.pow(Math.abs(Math.sin(y / pathLength * Math.PI)), 0.3) * pathWeight;
    if (isHard) {
      baseAt = -baseAt;
    }
    return {at: baseAt + x, width};
  }

  /**
   * @param {vec.Vector} at
   * @return {boolean}
   */
  collide(at) {
    for (let i = 0; i < this._items.length; ++i) {
      const item = this._items[i];
      if (item.type !== 'tree') { continue; }

      // TODO(samthor): short-circuit for far Y-ranges
      // TODO(samthor): Trees have different sizes.
      const dist = vec.dist(at, item.ent.at);
      if (dist < crashThreshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  _treeType(x, y) {
    const type = ~~((0.5 + noise(x / 1.00124, y / 0.1241)) * treeCount);
    return clamp(type, 0, treeCount - 1);
  }

  /**
   * @param {number} x
   * @param {{at: number, width: number}} path
   * @return {number} >0 if outside path, <0 if within
   */
  _withinPath(x, path) {
    const halfWidth = path.width / 2;
    const delta = Math.abs(x - path.at);
    return (delta / halfWidth) - 1;
  }

  /**
   * Decorates a single cell with an optional tree.
   * @param {number} x of cell
   * @param {number} y of cell
   */
  _decorateCell(x, y) {
    let v = noise(x / 3.27, y / 8.742);
    if (v <= treeNoiseThreshold) {
      return;
    }

    const midX = (x + 0.5) * cellSize;
    const midY = (y + 0.5) * cellSize;
    if ((v + this._withinPath(midX, this._pathRange(false, midY)) * 2) <= treeNoiseThreshold) {
      return;
    }
    if ((v + this._withinPath(midX, this._pathRange(true, midY))) <= treeNoiseThreshold) {
      return;
    }

    const offX = noise(x / 4.1222, y / 8.2421);
    const offY = noise(x / 1.21, y / 2.31);
    const at = {
      x: cellSize * (x + 0.5 + 2 * offX),
      y: cellSize * (y + 0.5 + 2 * offY),
    };

    const type = this._treeType(x, y);
    const def = {spriteIndex: type, offset: 16, layer: 1};
    const ent = this._render.newSprite(def, at);
    this._items.push({ent, type: 'tree'});
  }
}