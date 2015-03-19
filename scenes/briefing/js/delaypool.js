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

goog.provide('app.DelayPool');

goog.require('app.Constants');

/**
 *
 * Sleepy class responsible for the sleepy elements (elves).
 *
 * @param {!Element} context Module context in a HTML element
 * @constructor
 */
app.DelayPool = function(context) {
  this.randomDelayPool = null;
  this.count = 0;
};

/**
 * Initializes the class.
 */
app.DelayPool.prototype.init = function() {
  this.setRandomDelayPool_();
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.DelayPool.prototype.destroy = function() {
  this.randomDelayPool = null;
};

/**
 * Feeds the randomDelayPool with an array of delays (in ms).
 *
 * @private
 */
app.DelayPool.prototype.setRandomDelayPool_ = function() {

  function shuffle(arr) {
    var count = arr.length;
    for (var idx = 0; idx < count - 1; idx++) {
      var swap = idx + Math.floor(Math.random() * count - idx);
      var tmp = arr[idx];
      arr[idx] = arr[swap];
      arr[swap] = tmp;
    }
  };

  // Duplicate array from constants
  this.randomDelayPool = app.Constants.RANDOM_DELAY_POOL_MS.slice(0);
  shuffle(this.randomDelayPool);

};

/**
 * Returns a random delay as specified in Constants.
 *
 * @private
 * @return {number} Delay in milliseconds.
 */
app.DelayPool.prototype.getRandomDelay_ = function() {
  if (!this.randomDelayPool || !this.randomDelayPool.length) {
    this.setRandomDelayPool_();
  }
  return this.randomDelayPool.pop();
};
