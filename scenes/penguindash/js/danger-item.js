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

goog.provide('app.DangerItem');

goog.require('app.Constants');
goog.require('app.Item');
goog.require('app.shared.pools');



/**
 * Constructor for scoring items that the player can catch.
 * @constructor
 * @extends {Item}
 * @param {!Game} game The game object.
 */
app.DangerItem = function(game) {
  app.Item.call(this, game);
  this.elem.addClass('item--danger');
  this.types = app.Constants.DANGER_TYPES;
};


/**
 * Inherit the Item prototype
 * @type {Item}
 */
app.DangerItem.prototype = Object.create(app.Item.prototype);


/**
 * Create a pool for app.DangerItem
 */
app.shared.pools.mixin(app.DangerItem);


/**
 * Initializes the item for reuse.
 */
app.DangerItem.prototype.onInit = function() {
  // Pick a danger item
  this.type = this.weightedRandomType(app.Constants.DANGER_WEIGHT);
  var birdType = parseInt(this.type.css[this.type.css.length - 1]);

  // Reset base properties
  this.reset();

  // Danger items fall at different speeds
  this.speed *= app.Constants.DANGER_SPEED_SCALE;

  // Birds flow from right or left
  if (birdType === 3) {
    this.x = app.Constants.SCENE_WIDTH + 150;
    this.y = app.DangerItem.randomNumber_(0, 0.2) * app.Constants.SCENE_HEIGHT;
    this.flowDirection = 'left';
    this.elem.css('left', 'auto');
  } else if (birdType === 4) {
    this.x = -150;
    this.y = app.DangerItem.randomNumber_(0, 0.2) * app.Constants.SCENE_HEIGHT;
    this.elem.css('left', 0);
    this.flowDirection = 'right';
  }

  // Override hit sound.
  this.sound = 'jetpack_hit';
};


/**
 * Registers a collision with the player.
 */
app.DangerItem.prototype.hit = function() {
  var score = -(~~(this.game.scoreboard.score * app.DangerItem.randomNumber_(0, 0.2)));
  var time = -(~~(this.game.scoreboard.lastSeconds * app.DangerItem.randomNumber_(0, 0.2)));
  this.triggerHit(score, time, score);
};


/**
 * Returns a random floating-point number between min and max
 * @param {number} min
 * @param {number} max
 * @return {number}
 * @private
 */
app.DangerItem.randomNumber_ = function(min, max) {
  return Math.random() * (max - min) + min;
};
