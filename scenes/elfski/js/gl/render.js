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
    this._available = [];

    /** @private {number} */
    this._index = 0;

    /** @private {number} */
    this._capacity = 0;
  }

  /**
   * Resizes this Renderable. Removes all existing data. All granted Allocs are now void.
   *
   * @param {number} size of verticies allowed
   * @export
   */
  resize(size) {
    this._index = 0;
    this._capacity = size;
    this._data = new Float32Array(size * this._program.attribSize);
    this._available = [];

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
   * Calls `gl.drawArrays` with the given type.
   *
   * @param {number} type of GL upload to do, e.g. `gl.TRIANGLES`.
   */
  drawArrays(type) {
    // this mostly exists to _not_ upload if we have no data
    if (!this._index) { return; }
    this._gl.drawArrays(type, 0, this._index);
  }

  /**
   * Allocate a number of verticies.
   * @param {number} count
   * @return {!Alloc}
   */
  alloc(count) {
    for (let i = 0; i < this._available.length; ++i) {
      // FIXME(samthor): For now, we just look for exact matches. Good for fixed size objects.
      const alloc = this._available[i];
      if (alloc.size !== count) {
        continue;
      }
      this._available.splice(i, 1);
      return alloc;
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
   * @return {boolean} whether this leaves a gap
   */
  _free(alloc) {
    if (alloc._from + alloc._size === this._capacity) {
      this._capacity -= alloc._size;
      // TODO: we may now have an unused Alloc at the end; it doesn't really matter though
      return false;
    }
    if (alloc._from > this._capacity) {
      // ???
      return false;
    }
    this._available.push(alloc);
    return true;
  }

}

class Alloc {
  /**
   * @param {!Renderable} r
   * @param {number} from
   * @param {number} size
   */
  constructor(r, from, size) {
    const attribSize = r._program.attribSize;
    const base = attribSize * from;

    /** @type {number} */
    this.from = from;

    /** @type {number} */
    this.size = size;

    /** @private {!Renderable} */
    this._r = r;

    /** @private {number} */
    this._base = base * Float32Array.BYTES_PER_ELEMENT;

    /** @private {!Float32Array} */
    this._sub = r._data.subarray(base, attribSize * (from + size));

    Object.freeze(this);
  }

  /**
   * Frees this alloc. This object should not be used after this call.
   */
  free() {
    if (this._r._free(this)) {
      this.clear();
    }
  }

  /**
   * Writes zeros to this alloc.
   */
  clear() {
    const sub = this._sub;
    for (let i = 0; i < sub.length; ++i) {
      sub[i] = 0;
    }
    this._upload();
  }

  /**
   * Update this Alloc with new data.
   *
   * @param {function(number, !Object<string, function(...number): void>): void} fn
   */
  update(fn) {
    let at = 0;
    const sub = this._sub;
    const write = function(off, ...values) {
      for (let i = 0; i < values.length; ++i) {
        sub[at + off + i] = values[i];
      }
    }

    const p = this._r._program;
    const attribSize = p.attribSize;
    const attrs = p.attrs;

    /** @type {!Object<string, function(...number): void>} */
    const updater = {};
    for (const key in attrs) {
      updater[key] = write.bind(null, attrs[key].offset);
    }

    for (let i = 0; i < this.size; ++i) {
      fn(i, updater);
      at += attribSize;
    }
    this._upload();
  }

  /**
   * Upload this Alloc to GL.
   */
  _upload() {
    const gl = this._r._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._r._buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, this._base, this._sub);
  }
}
