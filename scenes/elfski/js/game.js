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

goog.provide('app.Game');

/**
 * @fileoverview This is the entrypoint for Elf Ski. It runs `goog.provide` for the main
 * entrypoint, but the rest of the game is in modern ES6 modules.
 */

import {Character} from './physics.js';
import * as vec from './vec.js';
import {SantaRender} from './ents.js';
import * as util from './util.js';
import * as ents from './ents.js';
import {WorldManager} from './world.js';

/**
 * @type {vec.Vector} Magic numbers for player control speed.
 */
const unitScale = {x: 400, y: 600};

/**
 * @typedef {{
 *   char: Character,
 *   loc: vec.Vector,
 *   alloc: !Object
 * }}
 */
var PlayerSpec;

/**
 * @export
 */
app.Game = class Game {
  constructor(canvas, tiles) {
    this._render = new SantaRender(canvas, tiles);
    this._canvas = canvas;
    this._transform = {x: 0, y: 0};
    this._now = 0;
    this._world = new WorldManager(this._render);

    /** @type {!Object<string, {ent: !ents.PlayerEnt, pointer: ?vec.Vector, goal: ?vec.Vector}>} */
    this._remotePlayers = {};
    this._me = this._render.newPlayer(this.randomStartAt());
    this._physics = util.WeakStore(() => new Character());
  }

  randomStartAt() {
    return {
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 1) * 40,
    };
  }

  get transform() {
    return {x: this._transform.x, y: this._transform.y};
  }

  /**
   * @param {string} id
   * @param {?vec.Vector} pointer
   * @param {vec.Vector} goal
   */
  updateRemotePlayer(id, pointer, goal) {
    let p = this._remotePlayers[id];
    if (p === undefined) {
      p = {
        ent: this._render.newPlayer(goal),
        pointer,
        goal: null,
      };
      this._remotePlayers[id] = p;
    } else {
      p.pointer = pointer;
      p.goal = goal;
    }
  }

  clearRemotePlayer(id) {
    const p = this._remotePlayers[id];
    if (p !== undefined) {
      p.ent.free();
      delete this._remotePlayers[id];
    }
  }

  reset() {
    this._transform = {x: 0, y: 0};
    this._world.reset();
    this._me.free();
    this._me = this._render.newPlayer(this.randomStartAt());
  }

  resize() {
    this._world.decorate(this._transform, this._canvas);
  }

  /**
   * @param {number} delta fraction of second
   * @param {vec.Vector} pointer position relative to player
   * @param {boolean} stop whether to not move the player
   * @export
   */
  tick(delta, pointer, stop) {
    this._now += delta;

    const char = this._physics(this._me);
    const change = stop ? vec.zero : char.tick(delta, pointer);
    if (change.x || change.y || char.angle !== this._me.angle) {
      const at = vec.add(this._me.at, vec.multVec(change, unitScale));
      this._me.update(at, char.angle);

      this._transform = vec.mult(at, -1);
      this._render.transform = this._transform;
    }

    // move other players
    for (const id in this._remotePlayers) {
      const p = this._remotePlayers[id];

      const char = this._physics(p.ent);
      const change = char.tick(delta, p.pointer);
      const changeScale = vec.multVec(change, unitScale);
      let at = p.ent.at;

      if (p.goal) {
        if (vec.dist(at, p.goal) > 24) {
          // too far away, just jump to real location
          at = p.goal;
          p.goal = null;
        } else {
          at = vec.lerp(at, p.goal, delta);
        }
      }

      at = vec.add(at, changeScale);
      p.ent.update(at, char.angle);
    }

    // determine whether we need to do local work
    if (change.y < 0) {
      throw new Error('should never go back up')
    } else if (!change.y) {
      return;  // all done
    }

    this.resize();  // calls decorate
    if (this._world.collide(this._me.at)) {
      return true;
    }
  }

  /**
   * @export
   */
  draw() {
    this._render.draw();
  }

  get playerAt() {
    return this._me.at;
  }
};
