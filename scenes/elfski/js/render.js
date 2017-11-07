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

import * as webgl from './webgl.js';

const spriteVertexShader = `
// Corrects for screen size.
uniform vec2 u_screenDims;

// Center of the sprite in screen coordinates
attribute vec2 centerPosition;

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
                           centerPosition.y + halfDims.y - spriteSize / 2.0);

  // Rotate as appropriate
  float s = sin(rotation);
  float c = cos(rotation);
  mat2 rotMat = mat2(c, -s, s, c);
  vec2 scaledOffset = spriteSize * cornerOffset;
  vec2 pos = updateCenter + rotMat * scaledOffset;

  // depth goes from 0-1, where 0=(-screenDims.y) and 1=(2*screenDims.y)
  float depthRange = u_screenDims.y * 3.0;
  float depth = 1.0 - (updateCenter.y + u_screenDims.y + u_transform.y) / depthRange;

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

  // TODO: alpha isn't being blended properly
  if (color.a == 0.0)
    discard;

  gl_FragColor = color;
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
 * @type {!Object<string, number>}
 */
const constantAttributes = [
  'rotation',
  'spriteIndex',
  'spriteSize',
  'cornerOffset',
  'spriteTextureSize',
  'spritesPerRow',
];

const constantAttributeSize = (constantAttributes.length * 2);

const constantAttributeInfo = (function() {
  const out = {};

  constantAttributes.forEach((attr, i) => {
    out[attr] = {
      attr,
      size: (attr === 'cornerOffset' || attr === 'spriteTextureSize') ? 2 : 1,
      offset: i * 2,
    };
  });

  return out;
})();

const zeroTransform = Object.freeze({x: 0, y: 0});

export default class SpriteGame {
  constructor(canvas, tiles) {
    this.canvas = canvas;
    this.tiles = tiles;

    const args = {};
    const gl = this.gl = canvas.getContext('webgl', args);
    if (!gl) {
      throw new TypeError('no webgl');
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this._index = 0;
    this._capacity = 0;
    this._freeIndex = [];

    this._positionData = new Float32Array(0);
    this._constantData = new Float32Array(0);

    this._program = null;
    this._loc = {};

    this._loadProgram();
    this._spriteBuffer = gl.createBuffer();
    this._resize(600, false);
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

  _loadProgram() {
    const gl = this.gl;
    const program = webgl.initShaderProgram(gl, spriteVertexShader, spriteFragmentShader);
    this._program = program;

    this._loc['u_screenDims'] = gl.getUniformLocation(program, 'u_screenDims');
    this._loc['u_transform'] = gl.getUniformLocation(program, 'u_transform');
    this._loc['u_texture'] = gl.getUniformLocation(program, 'u_texture');
    this._loc['centerPosition'] = gl.getAttribLocation(program, 'centerPosition');

    constantAttributes.forEach((n) => {
      this._loc[n] = gl.getAttribLocation(program, n);
    });
  }

  /**
   * @param {number} size of sprite data
   * @param {boolean} preserve whether to preserve existing data
   */
  _resize(size, preserve) {
    this._capacity = size;

    const verticies = size * offsets.length;
    this._positionData = new Float32Array(2 * verticies);
    this._constantData = new Float32Array(constantAttributeSize * verticies);

    const gl = this.gl;
    const bufferSize =
        Float32Array.BYTES_PER_ELEMENT * (this._positionData.length + this._constantData.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._spriteBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.DYNAMIC_DRAW);

    this._index = 0;

    if (preserve) {
      throw new Error('preserve not respected yet');
    }
  }

  /**
   * @param {number|undefined} index of sprite
   * @param {number} x position from origin
   * @param {number} y position from origin
   * @param {number} spriteIndex index into tiles
   * @param {number} rotation in rads
   * @export
   */
  update(index, x, y, spriteIndex, rotation) {
    if (index === undefined) {
      index = this._freeIndex.shift();
      if (index === undefined) {
        if (this._index === this._capacity) {
          throw new Error(`can't add sprite, at capacity: ${this._capacity}`);
        }
        index = this._index;
        ++this._index;
      }
    } else if (index < 0 || index >= this._index || this._freeIndex.indexOf(index) !== -1) {
      throw new Error(`can't update sprite, invalid or free ID: ${index}'`);
    }

    this._updateAt(index, x, y, spriteIndex, rotation);
    return index;
  }

  /**
   * @param {number} i index of sprite
   * @param {number} x position from origin
   * @param {number} y position from origin
   * @param {number} spriteIndex index into tiles
   * @param {number} rotation in rads
   * @export
   */
  _updateAt(i, x, y, spriteIndex, rotation) {
    const spriteSize = 128;
    const textureSize = 512;

    const vertexBase = i * offsets.length;

    for (let ii = 0; ii < offsets.length; ++ii) {
      const offset = offsets[ii];
      const vertexIndex = vertexBase + ii;

      this._positionData[2 * vertexIndex + 0] = x;
      this._positionData[2 * vertexIndex + 1] = y;

      const b = constantAttributeSize * vertexIndex;
      const s = (attr, off, value) => {
        this._constantData[b + constantAttributeInfo[attr].offset + off] = value;
      };

      s('rotation', 0, rotation);
      s('spriteIndex', 0, spriteIndex);
      s('spriteSize', 0, spriteSize);
      s('cornerOffset', 0, offset[0]);
      s('cornerOffset', 1, offset[1]);
      s('spriteTextureSize', 0, spriteSize / textureSize);
      s('spriteTextureSize', 1, spriteSize / textureSize);
      s('spritesPerRow', 0, textureSize / spriteSize);
    }

    // The constant data won't change, so we can immediately upload it.
    // Remember that the _positionData is at the start of _spriteBuffer.
    const gl = this.gl;
    const base = vertexBase * constantAttributeSize;
    const start = (this._positionData.length + base) * Float32Array.BYTES_PER_ELEMENT;
    const sub = this._constantData.subarray(base, base + offsets.length * constantAttributeSize);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._spriteBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, start, sub);
  }

  /**
   * Removes the numbered sprite.
   * @param {number} v sprite to remove
   * @export
   */
  remove(v) {
    if (v < 0 || v >= this._index) {
      return;  // do nothing, out of bounds
    }

    const alreadyFree = (this._freeIndex.indexOf(v) !== -1);
    if (alreadyFree) {
      return;  // already in freeIndex
    }

    if (v + 1 === this._index) {
      --this._index;  // if this is the last sprite, just trim buffer
      return;
    }

    // TODO(samthor): do something better than this
    this._updateAt(v, -10000000, 0, 0, 0);
    this._freeIndex.push(v);
  }

  /**
   * @return {number} the number of sprites that can still be added
   */
  get spritesFree() {
    return this._capacity - this._index + this._freeIndex.length;
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
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Upload all verticies.
    // TODO: we could do this on change, not here
    gl.bindBuffer(gl.ARRAY_BUFFER, this._spriteBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._positionData.subarray(0, 2 * this._index * offsets.length));

    // Upload just a single texture.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);

    gl.useProgram(this._program);
    gl.enableVertexAttribArray(this._loc['centerPosition']);
    gl.vertexAttribPointer(this._loc['centerPosition'], 2, gl.FLOAT, false, 0, 0);

    const base = this._positionData.length;
    constantAttributes.forEach((attr) => {
      const loc = this._loc[attr];
      const info = constantAttributeInfo[attr];
      if (info === undefined || loc === undefined) {
        throw new Error('expected valid info and loc: ' + attr);
      }
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc,
          info.size,
          gl.FLOAT,
          false,
          constantAttributeSize * Float32Array.BYTES_PER_ELEMENT,  // stride from offset
          (base + info.offset) * Float32Array.BYTES_PER_ELEMENT);
    });

    gl.uniform2f(this._loc['u_transform'], this._transform.x, this._transform.y);
    gl.uniform2f(this._loc['u_screenDims'], this.canvas.width, this.canvas.height);
    gl.uniform1i(this._loc['u_texture'], 0);

    if (!this._index) {
      return;  // nothing to draw
    }
    gl.drawArrays(gl.TRIANGLES, 0, this._index * offsets.length);
  };
  
}