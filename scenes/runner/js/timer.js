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

goog.provide('app.Timer');

/**
 * A timer object that wraps setTimeout and allows pause and resume.
 * @param {function} callback
 * @param {number} delay
 * @constructor
 */
app.Timer = function(callback, delay) {
  this.timerId;
  this.start;
  this.remaining = delay;
  this.alive = true;
  var timer = this;

  this.pause = function() {
    if(this.alive) {
      window.clearTimeout(this.timerId);
      this.remaining -= new Date() - this.start;
    }
  };

  this.resume = function() {
    if(this.alive) {
      this.start = new Date();
      this.timerId = window.setTimeout(function(){
        callback();
        timer.alive = false;
      }, this.remaining);
    }
  };

  this.resume();
};
