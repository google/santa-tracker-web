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
uniform vec4 u_screenDims;

// Center of the sprite in screen coordinates
attribute vec2 centerPosition;

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
  // Compute the row
  float row = floor(spriteIndex / spritesPerRow);
  // Compute the upper left texture coordinate of the sprite
  vec2 upperLeftTC = vec2(spriteTextureSize.x * (spriteIndex - (row * spritesPerRow)),
                          spriteTextureSize.y * row);
  // Compute the texture coordinate of this vertex
  vec2 tc = upperLeftTC + spriteTextureSize * (cornerOffset + vec2(0.5, 0.5));
  v_texCoord = tc;

  float s = sin(rotation);
  float c = cos(rotation);
  mat2 rotMat = mat2(c, -s, s, c);
  vec2 scaledOffset = spriteSize * cornerOffset;
  vec2 pos = centerPosition + rotMat * scaledOffset;
  gl_Position = vec4(pos * u_screenDims.xy + u_screenDims.zw, 0.0, 1.0);
}
`;

const spriteFragmentShader = `
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_texCoord;

void main() {
  gl_FragColor = texture2D(u_texture, v_texCoord);
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

export default class SpriteGame {
  constructor(canvas, tiles) {
    this.canvas = canvas;
    this.tiles = tiles;

    const gl = this.gl = canvas.getContext('webgl');
    if (!gl) {
      throw new TypeError('no webgl');
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this._index = 0;
    this._capacity = 0;
    this._positionData = new Float32Array();
    this._constantData = new Float32Array();

    this._program = null;
    this._loc = {};

    this._loadProgram();
    this._spriteBuffer = gl.createBuffer();  // TODO: badly named? contains positions + data
    this._resize(600, false);
    this._texture = webgl.loadTexture(gl, tiles);
  }

  _loadProgram() {
    const gl = this.gl;
    const program = webgl.initShaderProgram(gl, spriteVertexShader, spriteFragmentShader);
    this._program = program;

    this._loc['u_screenDims'] = gl.getUniformLocation(program, 'u_screenDims');
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
    size *= 6;
    this._capacity = size;
    this._positionData = new Float32Array(2 * size);
    this._constantData = new Float32Array(constantAttributeSize * size);

    const gl = this.gl;
    const bufferSize =
        Float32Array.BYTES_PER_ELEMENT * (this._positionData.length + this._constantData.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._spriteBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.DYNAMIC_DRAW);

    this._index = 0;
    // TODO: respect `preserve`
  }

  add(x, y, spriteIndex, rotation) {

    const spriteSize = 32;
    const textureSize = 256;

    for (let ii = 0; ii < offsets.length; ++ii) {
      const offset = offsets[ii];
      const vertexIndex = this._index + ii;

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
    const base = this._index * constantAttributeSize;
    const start = (this._positionData.length + base * Float32Array.BYTES_PER_ELEMENT);
    const sub = this._constantData.subarray(base, base + offsets.length * constantAttributeSize);
    console.info('uploading constant data for quad at', this._index, 'start', start, 'sub', sub);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._spriteBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, start, sub);

    this._index += offsets.length;
  }

  draw() {
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Upload all verticies.
    // TODO: we could do this on change, not here
    gl.bindBuffer(gl.ARRAY_BUFFER, this._spriteBuffer);
    console.info('uploading', this._positionData.subarray(0, 2 * this._index));
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._positionData.subarray(0, 2 * this._index));

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

    gl.uniform4f(this._loc['u_screenDims'],
                  2.0 / this.canvas.width,
                 -2.0 / this.canvas.height,
                 -1.0,
                  1.0);
    gl.uniform1i(this._loc['u_texture'], 0);

    gl.drawArrays(gl.TRIANGLES, 0, this._index);
  };
  
}