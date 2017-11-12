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
 * @template T
 * @param {function(): T} builder
 * @return {function(!Object): T}
 */
export function WeakStore(builder) {
  const m = new WeakMap();

  return function(key) {
    let x = m.get(key);
    if (x === undefined) {
      x = builder();
      m.set(key, x);
    }
    return x;
  };
}

/**
 * @param {number} v
 * @param {number} low
 * @param {number} high
 * @return {number}
 */
export function clamp(v, low, high) {
  if (v < low) {
    return low;
  } else if (v > high) {
    return high;
  }
  return v;
}
