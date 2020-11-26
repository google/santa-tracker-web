/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/**
 * @template T
 * @param {!Array<T>} all 
 * @param {number} valueToFind 
 * @param {function(T): number} fn 
 * @return {number}
 */
export function bisectLeft(all, valueToFind, fn) {
  let low = 0, high = all.length;
  while (low < high) {
    const mid = ~~((low + high) / 2);
    const valueOfItem = fn(all[mid]);
    if (valueOfItem < valueToFind) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}


/**
 * @template T
 * @param {!Array<T>} all 
 * @param {number} valueToFind 
 * @param {function(T): number} fn 
 * @return {number}
 */
export function bisectRight(all, valueToFind, fn) {
  let low = 0, high = all.length;
  while (low < high) {
    const mid = ~~((low + high) / 2);
    const valueOfItem = fn(all[mid]);
    if (valueToFind < valueOfItem) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}
