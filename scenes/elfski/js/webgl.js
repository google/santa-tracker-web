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

/**
 * @param {number} v
 * @return {boolean}
 */
function validPowerOfTwo(v) {
  if (v < 16) {
    return false;
  }
  return (v & (v - 1)) === 0;
}

/**
 * @param {!WebGLRenderingContext} gl
 * @param {!Image} image
 * @return {!WebGLTexture}
 */
export function loadTexture(gl, image) {
  if (!validPowerOfTwo(image.width) || !validPowerOfTwo(image.height)) {
    throw new TypeError(`expected >16x16 power of two image, was: ${image.width}/${image.height}`);
  }

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

/**
 * @param {!WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 * @return {!WebGLShader}
 */
export function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new TypeError(`couldn't compile shader: ${gl.getShaderInfoLog(shader)}'`);
  }
  return shader;
}

/**
 * @param {!WebGLRenderingContext} gl
 * @param {string} vsSource
 * @param {string} fsSource
 * @return {!WebGLProgram}
 */
export function initShaderProgram(gl, vsSource, fsSource) {
  const shaderProgram = gl.createProgram();

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new TypeError(`couldn't link shader program: ${gl.getProgramInfoLog(shaderProgram)}'`);
  }

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return shaderProgram;
}

/**
 * @typedef {{
 *   size: number,
 *   offset: number,
 *   loc: number
 * }}
 * @export
 */
var AttribInfo;

/**
 * Wraps a GL shader.
 */
export class ShaderProgram {
  constructor(gl, vsSource, fsSource) {
    /** @private {!WebGLRenderingContext} */
    this._gl = gl;

    /** @private {!WebGLProgram} */
    this._program = initShaderProgram(gl, vsSource, fsSource);

    /** @private {!Object<string, !WebGLUniformLocation>} */
    this._uniform = {};

    /** @private {!Object<string, AttribInfo>} */
    this._attrib = {};

    const uniformCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; ++i) {
      const info = gl.getActiveUniform(this._program, i);
      this._uniform[info.name] = gl.getUniformLocation(this._program, info.name);
    }

    let size = 0;
    const names = [];
    const attributeCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attributeCount; ++i) {
      const info = gl.getActiveAttrib(this._program, i);
      names.push(info.name);

      /** @type {AttribInfo} */
      const attrib = Object.freeze({
        // TODO(samthor): It seems like the returned `info.size` is the count of type, but I've
        // previously assumed that we need the size to be number of floats. Check this later: at
        // worst right now we're just wasting a bit of extra memory.
        size: info.size * ShaderProgram.sizeForType_(gl, info.type),
        offset: size,
        loc: gl.getAttribLocation(this._program, info.name),
      });
      this._attrib[info.name] = attrib;
      size += attrib.size;
    }

    Object.freeze(this._attrib);  // freeze our storage so we can return it

    /** @private {!Array<string>} */
    this._attribs = Object.freeze(names);

    /** @private {number} */
    this._attribSize = size;
  }

  /**
   * @return {!WebGLRenderingContext}
   * @export
   */
  get gl() {
    return this._gl;
  }

  /**
   * @return {!WebGLProgram}
   * @export
   */
  get program() {
    return this._program;
  }

  /**
   * @param {string} key
   * @return {?AttribInfo} info
   * @export
   */
  info(key) {
    return this._attrib[key] || null;
  }

  /**
   * @return {!Object<string, AttribInfo>}
   * @export
   */
  get attrs() {
    return this._attrib;  // TODO: fix badly named thing
  }

  /**
   * @return {!Array<string>}
   * @export
   */
  get attribs() {
    return this._attribs;
  }

  /**
   * @return {number}
   * @export
   */
  get attribSize() {
    return this._attribSize;
  }

  /**
   * @param {string} key
   * @return {number}
   * @export
   */
  a(key) {
    const info = this._attrib[key];
    return info ? info.loc : -1;
  }

  /**
   * @param {string} key
   * @return {!WebGLUniformLocation}
   * @export
   */
  u(key) {
    return this._uniform[key] || null;
  }

  /**
   * @param {!WebGLRenderingContext} gl
   * @param {number} type
   * @return {number}
   */
  static sizeForType_(gl, type) {
    switch (type) {
    case gl.FLOAT:
      return 1;
    case gl.FLOAT_MAT2:
    case gl.FLOAT_VEC2:
      return 2;
    case gl.FLOAT_MAT3:
    case gl.FLOAT_VEC3:
      return 3;
    case gl.FLOAT_MAT4:
    case gl.FLOAT_VEC4:
      return 4;
    }
    throw new TypeError(`unknown type: ${type}`)
  }
}
