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


goog.provide('app.shared.Coordinator');

/**
 * Coordinator is a timer based on deltas from onFrame.
 * @const
 */
var Coordinator = {
  waiting: []
};

/**
 * Resets the coordinator.
 */
Coordinator.reset = function() {
  Coordinator.waiting = [];
};

/**
 * Execute a function after time specified.
 * @param {number} sec The time in seconds.
 * @param {function()} callback The function to call.
 */
Coordinator.after = function(sec, callback) {
  Coordinator.waiting.push({
    remaining: sec,
    callback: callback
  });
};

/**
 * Execute a function after time specified and report progress on each frame.
 * @param {number} sec The time in seconds.
 * @param {function(number)} step The function called to report progress.
 * @param {function()} callback The function to call in the end.
 */
Coordinator.step = function(sec, step, callback) {
  Coordinator.waiting.push({
    total: sec,
    remaining: sec,
    callback: callback,
    step: step
  });
};

/**
 * Execute a function after time specified and report progress on each frame.
 * Reports the progress in reverse. Starts in 1 and ends in 0.
 * @param {number} sec The time in seconds.
 * @param {function(number)} step The function called to report progress.
 * @param {function()} callback The function to call in the end.
 */
Coordinator.stepReverse = function(sec, step, callback) {
  Coordinator.waiting.push({
    total: sec,
    remaining: sec,
    callback: callback,
    step: step,
    reverse: true
  });
};

/**
 * Called on every frame.
 * @param {number} delta The time since last frame.
 */
Coordinator.onFrame = function(delta) {
  for (var i = 0, wait; wait = Coordinator.waiting[i]; i++) {
    wait.remaining -= delta;
    if (wait.remaining < 0) {
      wait.remaining = 0;
    }

    // Report progress
    if (wait.step) {
      var progress = wait.remaining / wait.total;
      if (!wait.reverse) {
        progress = 1 - progress;
      }
      wait.step(progress);
    }

    // Is the wait finished?
    if (wait.remaining <= 0) {
      wait.callback();

      // Remove from list
      Coordinator.waiting.splice(i--, 1);
    }
  }
};

// We are *leaking* the Coordinator global for backwards compatibility.
app.shared.Coordinator = Coordinator;
