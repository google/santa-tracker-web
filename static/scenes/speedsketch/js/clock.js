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
'use strict';

goog.provide('app.Clock');
goog.require('app.Constants');
goog.require('app.EventEmitter');


/**
 * @constructor
 */
app.Clock = function() {
  app.EventEmitter.call(this);
  this.reset();
  this.started = false;
};


app.Clock.prototype = Object.create(app.EventEmitter.prototype);


app.Clock.prototype.reset = function() {
  this.totalTime = app.Constants.INITIAL_COUNTDOWN;
  this.timeLeft = app.Constants.INITIAL_COUNTDOWN;
  this.started = false;
};


app.Clock.prototype.startClock = function() {
  this.started = true;

  if (this.interval) {
    clearInterval(this.interval);
  }

  this.interval = setInterval(function() {
    var oldTimeLeft = Math.round(this.timeLeft);
    this.timeLeft -= 0.1;
    if (oldTimeLeft != Math.round(this.timeLeft)) {
      this.emit('TIME_DOWN');
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.pauseClock();
      this.emit('TIMES_UP');
    }
  }.bind(this), 100);
};


app.Clock.prototype.pauseClock = function() {
  this.started = false;
  clearInterval(this.interval);
  this.interval = null;
};
