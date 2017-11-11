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

import { Character } from './physics.js';
import * as render from './render.js';
import * as webgl from './webgl.js';
import * as vec from './vec.js';

/**
 * Magic numbers for player control speed.
 *
 * @type {vec.Vector}
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

function lerp(from, to, by, threshold=0) {
  const out = from + (to - from) * by;

  if (Math.abs(out - to) < threshold) {
    return to;
  }
  return out;
}

/**
 * @export
 */
app.Game = class Game {
  constructor(canvas, tiles) {
    this._render = new SantaRender(canvas, tiles);
    this._canvas = canvas;
    this._transform = {x: 0, y: 0};

    /** @type {!Object<string, !Player>} */
    this._remotePlayers = {};
    this._me = new Player(this._render);

    this._pathTo = 0;
    this._ents = [];

    this._now = 0;
  }

  get transform() {
    return {x: this._transform.x, y: this._transform.y};
  }

  /**
   * @param {string} id
   */
  updateRemotePlayer(id, pointer, at) {
    let p = this._remotePlayers[id];
    if (p === undefined) {
      p = new Player(this._render);
      this._remotePlayers[id] = p;
      p.at = at;
    }
    p.pointer = pointer;
    p.goal = at;
  }

  clearRemotePlayer(id) {
    const p = this._remotePlayers[id];
    if (p !== undefined) {
//      p.dispose();
      delete this._remotePlayers[id];
    }
  }

  _updatePath() {
    const atPixels = 60;

    while (this._pathTo < this._me.at.y + this._canvas.offsetHeight / 2) {
      this._pathTo += atPixels;

      const drift = Math.sin(this._pathTo / 155) + Math.cos(this._pathTo / 255);

      for (let i = 0; i < 2; ++i) {
        const at = {x: i ? 200 : -200, y: this._pathTo};
        const def = {at: at, spriteIndex: 5, offset: 16};

        if (this._pathTo % (atPixels * 2)) {
          def.spriteIndex = 4;
        }

        at.x += drift * 40;

        const alloc = this._render.update(undefined, def);
        this._ents.push({alloc, at, type: 'dot'});
      }
    }
  }

  /**
   * @param {number} fraction of second
   * @param {vec.Vector} pointer position relative to player
   * @export
   */
  tick(delta, pointer) {
    this._updatePath()
    this._now += delta;

    const change = this._me.char.tick(delta, pointer);
    const unitChange = change.x ? vec.unitVec(change) : change;

    // TODO: simplify line
    let lineChange = false;
    if (change.x) {
      this._me.line.push({
        x: this._me.at.x,
        y: this._me.at.y,
        w: 5 * (1 + this._me.char.lineWidth),
        at: this._now,
      });
      lineChange = true;
    }
    while (this._me.line.length > 40 || (this._me.line[0] && this._me.line[0].at < this._now - 2)) {
      lineChange = true;
      this._me.line.shift();
    }
    lineChange && this._render.updateLine(this._me.lineAlloc, this._me.line);

    this._me.at.x += (change.x * unitScale.x);
    this._me.at.y += (change.y * unitScale.y);

    // TODO: lerp "away" from X goal
    this._transform.x = -this._me.at.x;
    this._transform.y = -this._me.at.y;

    const def = {at: this._me.at, spriteIndex: 6, rotation: this._me.char.angle, offset: 64};
    this._render.update(this._me.spriteAlloc, def);
    this._render.transform = this._transform;

    // move other players
    for (const id in this._remotePlayers) {
      const p = this._remotePlayers[id];

      const change = p.char.tick(delta, p.pointer);
      if (p.goal) {
        p.at.x = lerp(p.at.x, p.goal.x, delta, 1);
        p.at.y = lerp(p.at.y, p.goal.y, delta, 1);
        p.goal.x += (change.x * unitScale.x);
        p.goal.y += (change.y * unitScale.y);
      }
      p.at.x += (change.x * unitScale.x);
      p.at.y += (change.y * unitScale.y);

      const def = {at: p.at, spriteIndex: 6, rotation: p.char.angle, offset: 64};
      this._render.update(p.spriteAlloc, def);
    }

    // determine whether we need to do local work
    if (change.y < 0) {
      throw new Error('should never go back up')
    } else if (change.y > 0) {
      this._cleanup(delta);
    }
  }

  get playerAt() {
    return this._me.at;
  }

  get playerAngle() {
    return this._me.char.angle;
  }

  _cleanup(delta) {
    // remove offscreen (up) ents
    while (this._ents.length) {
      const next = this._ents[0];
      if (next.at.y > -this._transform.y - this._canvas.height) {
        break;  // don't remove anymore
      }
      this._render.remove(next.alloc);
      this._ents.shift();
    }

    // collide with ents
    this._ents.some((ent, i) => {
      if (ent.type !== 'tree') { return; }

      const delta = {
        x: ent.at.x - this._me.at.x,
        y: ent.at.y - this._me.at.y,
      };

      // TODO(samthor): Trees have different sizes.
      const dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
      if (dist < 12) {
        this._me.char.crash();
        // TODO: stop game
        // this._gameEndAt = window.performance.now();
        // this.fire('game-stop', {
        //   score: Math.floor(this._positionDownMountain / 100),
        // });
        return true;
      }
    });

    // add more trees
    if (Math.random() / 10 < this._me.char.speed * delta) {
      this.addTree();
    }
  }

  addTree() {
    const type = Math.floor(Math.random() * 4);

    const at = {
      x: ((Math.random() - 0.5) * this._canvas.width),
      y: (this._me.at.y + this._canvas.height / 2) + 256,  // hide offscreen
    };

    const def = {at, spriteIndex: type, offset: 16, layer: 1};
    const alloc = this._render.update(undefined, def);
    this._ents.push({alloc, at, type: 'tree'});
  }
};

class Player {
  constructor(render) {
    this.char = new Character();
    this.at = {x: 0, y: 0};

    this.line = [];

    this.steps = [];

    this.lineAlloc = render.updateLine(null, []);
    this.spriteAlloc = render.update(null, {at: this.at});
  }
}

const spriteVertexShader = `
uniform vec2 u_screenDims;

// Center of the sprite in screen coordinates
attribute vec2 centerPosition;

// Offset of the sprite's origin.
attribute float offsetY;

// Layer to push this sprite into.
attribute float layer;

// Transform of the whole screen.
uniform vec2 u_transform;

// Rotation to draw sprite at
attribute float rotation;

// Per-sprite frame offset.
attribute float spriteIndex;

// Sprite size in screen coordinates
attribute float spriteSize;

// Offset of this vertex's corner from the center, in normalized
// coordinates for the sprite. In other words:
//   (-0.5, -0.5) => Upper left corner
//   ( 0.5, -0.5) => Upper right corner
//   (-0.5,  0.5) => Lower left corner
//   ( 0.5,  0.5) => Lower right corner
attribute vec2 cornerOffset;

// Specified in normalized coordinates (0.0..1.0), where 1.0 = spriteSize.
attribute vec2 spriteTextureSize;

// Number of sprites per row of texture
attribute float spritesPerRow;

// Output to the fragment shader.
varying vec2 v_texCoord;

void main() {
  float row = floor(spriteIndex / spritesPerRow);
  float col = (spriteIndex - (row * spritesPerRow));

  vec2 upperLeftTC = vec2(spriteTextureSize.x * col, spriteTextureSize.y * row);

  // Get the texture coordinate of this vertex (cornerOffset is in [-0.5,0.5])
  v_texCoord = upperLeftTC + spriteTextureSize * (cornerOffset + vec2(0.5, 0.5));

  // Shift to center of screen, base of sprite.
  // TODO: We could make the origin configurable.
  vec2 halfDims = u_screenDims / 2.0;
  vec2 updateCenter = vec2(centerPosition.x + halfDims.x,
                           centerPosition.y + halfDims.y - spriteSize / 2.0 + offsetY);

  // Rotate as appropriate
  float s = sin(rotation);
  float c = cos(rotation);
  mat2 rotMat = mat2(c, -s, s, c);
  vec2 scaledOffset = spriteSize * cornerOffset;
  vec2 pos = updateCenter + rotMat * scaledOffset;

  // depth goes from 0-1, where 0=(-screenDims.y) and 1=(2*screenDims.y)
  float depthRange = u_screenDims.y * 3.0;
  float depth = 1.0 - (updateCenter.y + u_screenDims.y + u_transform.y) / depthRange;
  depth = depth - layer;

  vec4 screenTransform = vec4(2.0 / u_screenDims.x, -2.0 / u_screenDims.y, -1.0, 1.0);
  gl_Position = vec4((pos + u_transform) * screenTransform.xy + screenTransform.zw, depth, 1.0);
}
`;
const spriteFragmentShader = `
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_texCoord;

void main() {
  vec4 color = texture2D(u_texture, v_texCoord);

  if (color.a == 0.0) {
    // sanity discard if blend mode is bad
    discard;
  }

  gl_FragColor = color;
}
`;

const lineVertexShader = `
uniform vec2 u_screenDims;
uniform vec2 u_transform;

attribute vec2 position;
attribute vec2 normal;
attribute float miter;
attribute float thickness;

varying float v_thickness;

void main() {
  // push the point along its normal by half thickness
  vec2 p = position.xy + vec2(normal * thickness/2.0 * miter);

  vec2 halfDims = u_screenDims / 2.0;
  vec2 updateCenter = vec2(p.x + halfDims.x, p.y + halfDims.y);

  v_thickness = thickness;

  vec4 screenTransform = vec4(2.0 / u_screenDims.x, -2.0 / u_screenDims.y, -1.0, 1.0);
  gl_Position = vec4((updateCenter + u_transform) * screenTransform.xy + screenTransform.zw, 0.0, 1.0);
}
`;
const lineFragmentShader = `
precision mediump float;

varying float v_thickness;

void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

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
 *   at: {x: number, y: number},
 *   rotation: (undefined|number),
 *   offset: (undefined|number),
 *   layer: (undefined|number),
 *   spriteIndex: number
 * }}
 */
var SpriteDef;

const zeroTransform = Object.freeze({x: 0, y: 0});

export default class SantaRender {
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

    this._spriteProgram = new webgl.ShaderProgram(gl, spriteVertexShader, spriteFragmentShader);
    this._foreground = new render.Renderable(this._spriteProgram);
    this._foreground.resize(600 * 6);

    this._trailsProgram = new webgl.ShaderProgram(gl, lineVertexShader, lineFragmentShader);
    this._trails = new render.Renderable(this._trailsProgram);
    this._trails.resize(100 * 20);  // 100 players with 10 lines each?

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this._texture = webgl.loadTexture(gl, tiles);
    this._transform = zeroTransform;
  }

  /**
   * @param {?{x: number, y: number}} v
   */
  set transform(v) {
    this._transform = v ? Object.freeze({x: v.x, y: v.y}) : zeroTransform;
  }

 /**
  * @return {?{x: number, y: number}}
  */
  get transform() {
    return this._transform;
  }

  /**
   * @param {Alloc} alloc of sprite
   * @param {!Array<{x: number, y: number}>} points to draw
   * @return {!Alloc} alloc of sprite
   * @export
   */
  updateLine(alloc, points) {
    if (!alloc) {
      alloc = this._trails.alloc(80);
    }

    let curr = 0;
    let start = true;
    let last = undefined;

    alloc.update((i, update) => {
      const p = points[curr] || last;  // line to last point always
      if (p === undefined) {
        update.thickness(0);
        return;
      }

      last = p;
      update.position(p.x, p.y)
      update.normal(0, 0);
      update.miter(10);
      update.thickness(p.w);

      if (start) {
        ++curr;
      }
      start = !start;
    });

    return alloc;
  }

  /**
   * @param {Alloc} alloc of sprite
   * @param {SpriteDef} def of sprite
   * @return {!Alloc} alloc of sprite
   * @export
   */
  update(alloc, def) {
    if (!alloc) {
      alloc = this._foreground.alloc(6);
    }
    this._updateAt(alloc, def);
    return alloc;
  }

  /**
   * @param {Alloc} alloc of sprite
   * @param {SpriteDef} def of sprite
   * @export
   */
  _updateAt(alloc, def) {
    def = Object.assign({
      rotation: 0,
      offset: 0,
      layer: 0,
    }, def);

    const spriteSize = 128;
    const textureSize = 512;

    alloc.update((ii, u) => {
      const offset = offsets[ii];
      u.cornerOffset(offset[0], offset[1]);

      // everything else is the same per-sprite
      u.centerPosition(def.at.x, def.at.y);
      u.rotation(def.rotation);
      u.offsetY(def.offset);
      u.layer(def.layer);
      u.spriteIndex(def.spriteIndex);
      u.spriteSize(spriteSize);
      u.spriteTextureSize(spriteSize / textureSize, spriteSize / textureSize);
      u.spritesPerRow(textureSize / spriteSize);
    });
  }

  /**
   * Removes the numbered sprite.
   * @param {!Alloc} alloc to remove
   * @export
   */
  remove(alloc) {
    // TODO(samthor): do something better than this
    this._updateAt(alloc, {at: {x: -10000000, y: 0}, spriteIndex: 0});
    this._foreground.free(alloc);
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
    this._foreground.used && gl.drawArrays(gl.TRIANGLES, 0, this._foreground.used);

    // Run _trails and update its uniforms.
    this._trails.enableAll();
    gl.uniform2f(this._trailsProgram.u('u_transform'), this._transform.x, this._transform.y);
    gl.uniform2f(this._trailsProgram.u('u_screenDims'), this.canvas.width, this.canvas.height);
    this._trails.used && gl.drawArrays(gl.LINES, 0, this._trails.used);
  };
  
}

