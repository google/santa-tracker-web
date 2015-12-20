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

goog.provide('app.Item');

goog.require('Constants');
goog.require('app.Entity');
goog.require('app.shared.pools');

/**
 * Represents different presents and items the player should catch.
 * @constructor
 * @param {Game} game The game object.
 */
app.Item = function(game) {
  app.Entity.call(this);

  /** @type {Game} */
  this.game = game;

  /** @type {jQuery} */
  this.elem = $('<div class="item hidden">');
  this.scoreElem = $('<div class="item-text">').appendTo(this.elem);
  this.subElem = $('<div class="item-orb">').appendTo(this.elem);
  $('<div class="item-back">').appendTo(this.subElem);
  $('<div class="item-front">').appendTo(this.subElem);

  /** @type {boolean} */
  this.dead = false;

  /** @type {boolean} */
  this.isHit = false;

  /** @type {Constants.ItemType} */
  this.type = null;

  /** @type {number} */
  this.speed = 0;

  this.game.itemsElem.append(this.elem);
};

/**
 * Inherit from entity.
 */
app.Item.prototype = Object.create(app.Entity.prototype);

app.shared.pools.mixin(app.Item);

/**
 * Resets the item so it can be reused.
 */
app.Item.prototype.onInit = function() {
  this.elem.removeClass('hidden');
  this.subElem.show();
  this.scoreElem.attr('class', 'item-text');
  this.scoreElem[0].textContent = '';
  this.dead = false;
  this.isHit = false;

  // Pick a type
  this.type = app.Item.pickRandomType();

  // Set width and height in ems
  this.width = this.type.width;
  this.height = this.type.height;
  this.xgap = this.type.xgap;
  this.ygap = this.type.ygap;

  // Assign the visual look
  this.elem.attr('class', 'item ' + this.type.css);

  // Figure out the speed
  this.speed = (this.type.fast ? Constants.ITEM_SPEED_FAST : Constants.ITEM_SPEED_NORMAL);
  this.speed *= Math.pow(Constants.ITEM_SPEED_MULTIPLY_EACH_LEVEL, this.game.level);

  // Initial placement
  this.setPos(this.game.sceneSize.width, Math.random() * this.game.sceneSize.height * 0.4);
  this.elem.css('top', this.y + 'em');
};

/**
 * Removes this item from the game loop.
 */
app.Item.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Update this item by delta every frame.
 * @param {number} delta Seconds since last onFrame.
 */
app.Item.prototype.onFrame = function(delta) {
  this.setX(this.x - this.speed * delta);

  if (this.screenX > -this.width) {
    this.elem.css('transform', 'translate3d(' + this.x + 'em, 0, 0)');
  } else {
    this.remove();
  }
};

/**
 * Registers a collision with the player.
 */
app.Item.prototype.hit = function() {
  this.isHit = true;

  var timer = this.game.scoreboard.countdown, display;

  this.game.caughtItem(this.type.score * (this.game.level + 1), this.type.time);

  if (this.type.time > 0 && this.type.score === 0) {
    window.santaApp.fire('sound-trigger', 'glider_clock');
    if (this.type.time >= 10) {
      display = '+00:' + this.type.time;
    } else {
      display = '+00:0' + this.type.time;
    }
  } else {
    window.santaApp.fire('sound-trigger', 'generic_score');
    display = this.type.score;
  }

  this.subElem.hide();
  this.scoreElem.attr('class', 'item-score')[0].textContent = display;
  
};

/**
 * Returns the score received for catching this item. Can be tweaked for
 * different scoring rules.
 * @param {number} level The current level, 0-based.
 * @param {ItemType} type The type of the item giving the score.
 * @return {number} The score received.
 * @private
 */
app.Item.calculateScore_ = function(level, type) {
  return (type.fast ? Constants.ITEM_SCORE_FAST : Constants.ITEM_SCORE_NORMAL) * (level + 1);
};

/**
 * Returns the time received for catching this item.
 * @param {number} level The current level, 0-based.
 * @param {ItemType} type The type of the item giving the score.
 * @return {number} The time received.
 * @private
 */
app.Item.calculateTime_ = function(level, type) {
  return type.fast ? Constants.ITEM_TIME_FAST : Constants.ITEM_TIME_NORMAL;
};

/**
 * Returns a random item type with weighting.
 * @return {Constants.ItemType} The item type picked.
 */
app.Item.pickRandomType = function() {
  var value = Math.random() * app.Item.TOTAL_ITEM_WEIGHT_;

  for (var i = 0, type; type = Constants.ITEM_TYPES[i]; i++) {
    value -= type.weight;
    if (value < 0) {
      return type;
    }
  }
  return type;
};

/**
 * @type {number}
 * @const
 * @private
 */
app.Item.TOTAL_ITEM_WEIGHT_ = Constants.ITEM_TYPES.reduce(function(sum, type) {
  return sum + type.weight;
}, 0);
