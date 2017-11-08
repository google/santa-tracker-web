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
 * @fileoverview Basic 2D vector methods.
 */

/**
 * @typedef {{
 *   x: number,
 *   y: number
 * }}
 */
export var Vector;

/**
 * @param {Vector} vec
 * @return {Vector} the same vec, but modified
 */
function inlineUnitVec(vec) {
  const dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  vec.x /= dist;
  vec.y /= dist;
  return vec;
}

/**
 * @param {Vector} vec
 * @return {Vector}
 */
export function unitVec(vec) {
  return inlineUnitVec({x: vec.x, y: vec.y});
}

/**
 * @param {Vector} vecA
 * @param {Vector} vecB
 * @return {number}
 */
export function angleBetween(vecA, vecB) {
  const dot = vecA.x * vecB.x + vecA.y * vecB.y;
  return Math.acos(dot);
}

/**
 * @param {Vector} vecA
 * @param {Vector} vecB
 * @param {number} part
 * @return {Vector}
 */
export function slerp(vecA, vecB, part) {
  if (vecA.x === vecB.x && vecB.y === vecB.y) {
    return {x: vecA.x, y: vecA.y};  // make new object anyway
  }

  // assumes both are normal vectors
  const raw = vecA.x * vecB.x + vecA.y * vecB.y;
  const dot = Math.min(1, Math.max(-1, raw));  // clamp for sanity

  const theta_0 = Math.acos(dot);
  const theta = theta_0 * part;

  const vecC = inlineUnitVec({
    x: vecB.x - vecA.x * dot,
    y: vecB.y - vecA.y * dot,
  });

  return {
    x: vecA.x * Math.cos(theta) + vecC.x * Math.sin(theta),
    y: vecA.y * Math.cos(theta) + vecC.y * Math.sin(theta),
  };
}
