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

goog.provide('app.Scene');

goog.require('app.Clock');
goog.require('app.Constants');
goog.require('app.DelayPool');
goog.require('app.Elevator');
goog.require('app.Projection');
goog.require('app.Sleepy');
goog.require('app.SleepyController');
goog.require('app.Spectator');

/**
 * Briefing Scene class
 * Main class responsible for kicking off the scene's additional classes and
 * elements.
 *
 * @param {!Element} context An DOM element which wraps the scene.
 * @constructor
 * @export
 */
app.Scene = function(context) {
  var i = 0;
  var $spectator = null;
  var $clock = null;

  this.$context_ = $(context);
  this.context_ = this.$context_[0];

  this.projection = new app.Projection(this.$context_.find('.js-projection'));
  this.elevator = new app.Elevator(this.$context_.find('.js-elevator'));

  this.delayPool = new app.DelayPool();
  this.sleepyController = new app.SleepyController();

  this.spectators = [];
  this.sleepers = [];
  this.clocks = [];

  this.$spectators = this.$context_.find('.js-spectator');
  this.$clocks = this.$context_.find('.js-clock');

  this.numSpectators = this.$spectators.length;
  this.numSleepers = 0;
  this.numClocks = this.$clocks.length;

  for (i = 0; i < this.numSpectators; i++) {
    $spectator = this.$spectators.eq(i);

    this.spectators.push(new app.Spectator($spectator));

    // Sleepy?
    if ($spectator.data('is-sleepy')) {
      this.sleepers.push(new app.Sleepy($spectator, this.delayPool, this.sleepyController));
      this.numSleepers++;
    }
  }

  for (i = 0; i < this.numClocks; i++) {
    $clock = this.$clocks.eq(i);
    this.clocks.push(new app.Clock($clock));
  }

  // Go!
  this.init_();
};

/**
 * Initializes the Scene by biding some events
 *
 * @private
 */
app.Scene.prototype.init_ = function() {
  var i = 0;

  this.projection.init();
  this.elevator.init();
  this.delayPool.init();
  this.sleepyController.init();

  for (i = 0; i < this.numSpectators; i++) {
    this.spectators[i].init();
  }

  for (i = 0; i < this.numSleepers; i++) {
    this.sleepers[i].init();
  }

  for (i = 0; i < this.numClocks; i++) {
    this.clocks[i].init();
  }
};

/**
 * Stops the Briefing scene from running
 * @export
 */
app.Scene.prototype.destroy = function() {
  var i = 0;

  this.projection.destroy();
  this.elevator.destroy();
  this.delayPool.destroy();
  this.sleepyController.destroy();

  for (i = 0; i < this.numSpectators; i++) {
    this.spectators[i].destroy();
  }

  for (i = 0; i < this.numSleepers; i++) {
    this.sleepers[i].destroy();
  }

  for (i = 0; i < this.numClocks; i++) {
    this.clocks[i].destroy();
  }
};
