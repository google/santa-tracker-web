/*
 * Copyright 2015 Google Inc. All rights reserved.
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

goog.provide('app.utils');

/**
 * Generic shuffle function that shuffles an array.
 * @param {!Array} arr The array to be shuffled.
 */
app.utils.shuffleArray = function(arr) {
  var count = arr.length;
  for (var idx = 0; idx < count - 1; idx++) {
    var swap = idx + Math.floor(Math.random() * count - idx);
    var tmp = arr[idx];
    arr[idx] = arr[swap];
    arr[swap] = tmp;
  }
  return arr;
};
