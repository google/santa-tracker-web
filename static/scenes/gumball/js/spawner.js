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

goog.require('app.Constants');
goog.provide('app.Spawner');

/**
 * Maintains the top pipe. It has a queue of balls to spawn and moves
 * around on a rail to spawn them.
 * @param {!app.Game} game The game instance.
 * @param {!jQuery} elem The ceilingPipe dom element.
 * @constructor
 */
app.Spawner = function(game, elem) {
  this.game = game;
  this.elem = elem;
  this.performSpawn_ = this.performSpawn_.bind(this);
  this.goToNextSpawn_ = this.goToNextSpawn_.bind(this);

  /** @type {!Array<app.Sphere>} */
  this.queue = [];

  this.reset();
};

/**
 * Resets the spawner for game start.
 */
app.Spawner.prototype.reset = function() {
  this.x = 600;
  this.queue = [];
  this.render();
};

/**
 * Adds a sphere to the spawn queue.
 * @param {!app.Sphere} sphere
 */
app.Spawner.prototype.spawnSphere = function(sphere) {
  this.queue.push(sphere);
  if (this.queue.length === 1) {
    this.goToNextSpawn_();
  }
};

/**
 * Starts spawning next sphere. Moving if neccessary.
 * @private
 */
app.Spawner.prototype.goToNextSpawn_ = function() {
  var sphere = this.queue[0];
  if (!sphere) { return; }

  var distance = Math.abs(sphere.initialX - this.x);
  if (distance < 1) {
    this.performSpawn_();
    return;
  }

  var originalX = this.x;
  Coordinator.step(distance / app.Constants.SPAWNER_VELOCITY, function(per) {
    this.x = originalX + (sphere.initialX - originalX) * per;
  }.bind(this), this.performSpawn_);
};

/**
 * Actually spawns the ball.
 * @private
 */
app.Spawner.prototype.performSpawn_ = function() {
  const next = this.queue.shift();
  if (!next) {
    console.debug('performSpawn_ without queue');
    return;
  }
  next.spawn();

  window.santaApp.fire('sound-trigger', 'gb_new_ball');

  // nb. Delay by 100ms, this seems to resolve #1838.
  this.elem.removeClass('toggle-lever');  // for safety
  window.setTimeout(() => {
    this.elem.one('animationend', () => {
      this.elem.removeClass('toggle-lever');
      this.goToNextSpawn_();
    });
    this.elem.addClass('toggle-lever');
  }, 100);
};

/**
 * Render spawner.
 */
app.Spawner.prototype.render = function() {
  this.elem.css('transform', 'translate3d(' + this.x + 'px, 0, 0)');
};
