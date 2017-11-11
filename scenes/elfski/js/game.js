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

/**
 * @export
 */
app.Game = class Game {
  constructor() {
  }

  /**
   * @export
   * @return {!Character}
   */
  static newCharacter() {
    return new Character();
  }

 /**
  * @export
  * @return {function(): SpriteGame}
  */
  static getSpriteGame() {
    return SantaRender;
  }
};

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

attribute vec2 position;
attribute vec2 normal;
attribute float miter;
attribute float thickness;

void main() {
  //push the point along its normal by half thickness
  vec2 p = position.xy + vec2(normal * thickness/2.0 * miter);

  vec4 screenTransform = vec4(2.0 / u_screenDims.x, -2.0 / u_screenDims.y, -1.0, 1.0);
  gl_Position = vec4(p * screenTransform.xy + screenTransform.zw, 0.0, 1.0);
}
`;
const lineFragmentShader = `
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

    this._program = new webgl.ShaderProgram(gl, spriteVertexShader, spriteFragmentShader);
    this._renderable = new render.Renderable(this._program);
    this._renderable.resize(600 * 6);

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
   * @param {SpriteDef} def of sprite
   * @return {!Alloc} alloc of sprite
   * @export
   */
  update(alloc, def) {
    if (!alloc) {
      alloc = this._renderable.alloc(6);
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
    this._renderable.free(alloc);
  }

  /**
   * @export
   */
  draw() {
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Upload just a single texture.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);

    // Run the _renderable program and update its uniforms.
    this._renderable.enableAll();
    gl.uniform2f(this._program.u('u_transform'), this._transform.x, this._transform.y);
    gl.uniform2f(this._program.u('u_screenDims'), this.canvas.width, this.canvas.height);
    gl.uniform1i(this._program.u('u_texture'), 0);

    if (!this._renderable.used) {
      return;  // nothing to draw
    }
    gl.drawArrays(gl.TRIANGLES, 0, this._renderable.used);
  };
  
}

