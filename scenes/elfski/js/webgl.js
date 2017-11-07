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

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  //  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  //  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

//  gl.generateMipmap(gl.TEXTURE_2D);
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

  // gl.deleteShader(vertexShader);
  // gl.deleteShader(fragmentShader);

  return shaderProgram;
}
