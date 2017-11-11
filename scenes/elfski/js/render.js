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

/**
 * Renderable manages memory and the allocation/free of verticies for a wrapped
 * webgl.ShaderProgram.
 */
export class Renderable {
  /**
   * @param {!webgl.ShaderProgram} program
   */
  constructor(program) {
    this._gl = program.gl;
    this._program = program;

    /** @private {!Float32Array} */
    this._data = new Float32Array(0);

    /** @private {!WebGLBuffer} */
    this._buffer = this._gl.createBuffer();

    /** @private {!Array<!Alloc>} */
    this._free = [];

    /** @private {number} */
    this._index = 0;

    /** @private {number} */
    this._capacity = 0;
  }

  /**
   * @param {number} size
   * @export
   */
  resize(size) {
    this._index = 0;
    this._capacity = size;
    this._data = new Float32Array(size * this._program.attribSize);

    const bufferSize = this._data.length * Float32Array.BYTES_PER_ELEMENT;
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.DYNAMIC_DRAW);
  }

  /**
   * @return {number}
   */
  get used() {
    return this._index;
  }

  /**
   * Calls `gl.useProgram` and binds all the vertex attributes.
   */
  enableAll() {
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    gl.useProgram(this._program.program);

    const attribSize = this._program.attribSize;
    const attrs = this._program.attrs;
    for (const key in attrs) {
      const info = attrs[key];

      gl.enableVertexAttribArray(info.loc);
      gl.vertexAttribPointer(info.loc,
          info.size,
          gl.FLOAT,
          false,
          attribSize * Float32Array.BYTES_PER_ELEMENT,  // stride from offset
          info.offset * Float32Array.BYTES_PER_ELEMENT);
    }
  }

  /**
   * Allocate a number of verticies.
   * @param {number} count
   * @return {!Alloc}
   */
  alloc(count) {
    for (let i = 0; i < this._free.length; ++i) {
      // FIXME(samthor): For now, we just look for exact matches. Good for fixed size objects.
      if (this._free[i]._size !== count) {
        continue;
      }
      const found = this._free[i];
      this._free.splice(i, 1);
      return found;
    }

    if (this._index + count >= this._capacity) {
      throw new TypeError(`can't alloc ${count}, out of space`);
    }

    const from = this._index;
    this._index += count;
    return new Alloc(this, from, count);
  }

  /**
   * Frees a previously allocated Alloc. This may leave a gap in the allocation, which will still
   * be rendered.
   * @param {!Alloc} alloc
   */
  free(alloc) {
    if (alloc._from + alloc._size === this._capacity) {
      this._capacity -= alloc._size;
      // TODO: we may now have an unused Alloc at the end; it doesn't really matter though
      return;
    }
    if (alloc._from > this._capacity) {
      // ???
      return;
    }
    this._free.push(alloc);
  }

}

class Alloc {
  /**
   * @param {!Renderable} r
   * @param {number} from
   * @param {number} size
   */
  constructor(r, from, size) {
    this._r = r;
    this._from = from;
    this._size = size;
    Object.freeze(this);
  }

  /**
   * Update this Alloc with new data.
   *
   * @param {function(number, !Object<string, function(...number): void>): void} fn
   */
  update(fn) {
    const p = this._r._program;
    const data = this._r._data;
    const attribSize = p.attribSize;
    const base = attribSize * this._from;

    let at = base;
    const write = function(off, ...values) {
      for (let i = 0; i < values.length; ++i) {
        data[at + off + i] = values[i];
      }
    }

    const attrs = this._r._program.attrs;

    /** @type {!Object<string, function(...number): void>} */
    const updater = {};
    for (const key in attrs) {
      updater[key] = write.bind(null, attrs[key].offset);
    }

    for (let i = 0; i < this._size; ++i) {
      fn(i, updater);
      at += attribSize;
    }

    // reupload whole range
    const gl = this._r._gl;
    const sub = data.subarray(base, at);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._r._buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, base * Float32Array.BYTES_PER_ELEMENT, sub);
  }
}
