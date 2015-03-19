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

goog.provide('app.SleepyController');

goog.require('app.Constants');

/**
 * Sleepy controller that allows a sleepy character to sleep or not.
 *
 * @param {!Element} context An DOM element which wraps the scene.
 * @constructor
 */
app.SleepyController = function(context) {
  this.count = 0;
};

/**
 * Initializes the class.
 */
app.SleepyController.prototype.init = function() {
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.SleepyController.prototype.destroy = function() {
  this.count = 0;
};

/**
 * Finds out if the elf requesting to sleep can fall asleep, based on the limit
 * of elves sleeping at the same time.
 *
 * @return {boolean} true if allowed, false if not
 */
app.SleepyController.prototype.canSleep = function() {
  return this.count < app.Constants.SLEEPING_ELVES_LIMIT;
};

/**
 * Counts one more elf that just went to sleepy mode.
 */
app.SleepyController.prototype.addSleepy = function() {
  this.count++;
};

/**
 * Subtracts one less elf that just woke up.
 */
app.SleepyController.prototype.subtractSleepy = function() {
  this.count--;
};
