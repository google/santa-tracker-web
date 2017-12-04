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

import * as vec from './vec.js';
import * as webgl from './gl/webgl.js';
import * as render from './gl/render.js';
import * as lineShader from './shader/line.js';
import * as spriteShader from './shader/sprite.js';

/**
 * @type {!Array<!Array<number>>}
 */
const offsets = [
  [-0.5, -0.5],
  [-0.5,  0.5],
  [ 0.5, -0.5],
  [ 0.5, -0.5],
  [-0.5,  0.5],
  [ 0.5,  0.5],
];

/**
 * @typedef {{
 *   offset: (number|undefined),
 *   layer: (number|undefined),
 *   spriteIndex: number
 * }}
 */
export var SpriteDef;

export class SantaRender {
  constructor(canvas, tiles) {
    this.canvas = canvas;
    this.tiles = tiles;

    const args = {
      premultipliedAlpha: false,  // Ask for non-premultiplied alpha
    };
    const gl = this.gl = canvas.getContext('webgl', args);
    if (!gl) {
      throw new TypeError('no webgl');
    }

    this._spriteProgram = new webgl.ShaderProgram(gl, spriteShader.vertex, spriteShader.fragment);
    this._foreground = new render.Renderable(this._spriteProgram);
    this._foreground.resize(1200 * 6);

    this._trailsProgram = new webgl.ShaderProgram(gl, lineShader.vertex, lineShader.fragment);
    this._trails = new render.Renderable(this._trailsProgram);
    this._trails.resize(100 * 20);  // 100 players with 10 lines each?

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this._texture = webgl.loadTexture(gl, tiles);
    this._transform = vec.zero;
  }

  /**
   * @param {?{x: number, y: number}} v
   */
  set transform(v) {
    this._transform = v ? Object.freeze({x: v.x, y: v.y}) : vec.zero;
  }

 /**
  * @return {?{x: number, y: number}}
  */
  get transform() {
    return this._transform;
  }

  /**
   * @param {vec.Vector=} at
   * @return {!PlayerEnt}
   */
  newPlayer(at=vec.zero) {
    const spriteEnt = this.newSprite({spriteIndex: 6, offset: 64}, at);
    const lineAlloc = this._trails.alloc(80);
    return new PlayerEnt(spriteEnt, lineAlloc);
  }

  /**
   * @param {SpriteDef} def
   * @param {vec.Vector} at
   * @param {number=} rotation
   * @return {!SpriteEnt}
   */
  newSprite(def, at, rotation=0) {
    def = /** @type {SpriteDef} */ (Object.assign({
      layer: 0,
      offset: 0,
      spriteIndex: -1,
    }, def));

    const alloc = this._foreground.alloc(6);
    const spriteSize = 128;
    const textureSize = 512;

    alloc.update((ii, u) => {
      const offset = offsets[ii];
      u.cornerOffset(offset[0], offset[1]);

      // set default ent config
      u.centerPosition(at.x, at.y);
      u.rotation(rotation);

      // everything else is the same per-sprite
      u.offsetY(def.offset);
      u.layer(def.layer);
      u.spriteIndex(def.spriteIndex);
      u.spriteSize(spriteSize);
      u.spriteTextureSize(spriteSize / textureSize, spriteSize / textureSize);
      u.spritesPerRow(textureSize / spriteSize);
    });

    return new SpriteEnt(alloc, at);
  }

  /**
   * @export
   */
  draw() {
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
//    gl.clearColor(0.9608, 0.9490, 0.8863, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Run _foreground and update its uniforms.
    this._foreground.enableAll();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.uniform2f(this._spriteProgram.u('u_transform'), this._transform.x, this._transform.y);
    gl.uniform2f(this._spriteProgram.u('u_screenDims'), this.canvas.width, this.canvas.height);
    gl.uniform1i(this._spriteProgram.u('u_texture'), 0);
    this._foreground.drawArrays(gl.TRIANGLES);

    // Run _trails and update its uniforms.
    this._trails.enableAll();
    gl.uniform2f(this._trailsProgram.u('u_transform'), this._transform.x, this._transform.y);
    gl.uniform2f(this._trailsProgram.u('u_screenDims'), this.canvas.width, this.canvas.height);
    this._trails.drawArrays(gl.LINES);
  };
  
}

export class PlayerEnt {
  constructor(spriteEnt, lineAlloc) {
    this._spriteEnt = spriteEnt;
    this._lineAlloc = lineAlloc;

    /** @type {number} */
    this._rotation = 0;

    /** @type {!Array<vec.Vector>} */
    this._points = [];
  }

  /**
   * @return {vec.Vector}
   */
  get at() {
    return this._spriteEnt.at;
  }

  /**
   * @return {number}
   */
  get angle() {
    return this._rotation;
  }

  /**
   * @param {vec.Vector} at
   * @param {number} rotation
   */
  update(at, rotation) {
    this._rotation = rotation;
    this._spriteEnt.update(at, rotation);
    this._points.unshift(at);
    this._updateLine();
  }

  _updateLine() {
    let curr = 0;
    let start = true;
    let last = undefined;

    this._lineAlloc.update((i, update) => {
      const p = this._points[curr] || last;  // line to last point always
      if (p === undefined) {
        update.thickness(0);
        return;
      }

      last = p;
      update.position(p.x, p.y)
      update.normal(0, 0);
      update.miter(10);
      update.thickness(p.w || 1);

      if (start) {
        ++curr;
      }
      start = !start;
    });

    // remove excess line segments
    while (this._points.length > curr) {
      this._points.pop();
    }
  }

  free() {
    this._spriteEnt.free();
    this._lineAlloc.free();
  }
}

export class SpriteEnt {
  constructor(alloc, at=vec.zero) {
    this._alloc = alloc;
    this._at = at;
  }

  /**
   * @return {vec.Vector}
   */
  get at() {
    return this._at;
  }

  /**
   * @param {vec.Vector} at
   * @param {number=} rotation
   */
  update(at, rotation=undefined) {
    this._at = Object.freeze(at);
    this._alloc.update((ii, u) => {
      u.centerPosition(at.x, at.y);
      if (rotation !== undefined) {
        u.rotation(rotation);
      }
    });
  }

  free() {
    this._alloc.free();
  }
}