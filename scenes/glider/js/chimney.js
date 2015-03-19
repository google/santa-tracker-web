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

goog.provide('app.Chimney');

goog.require('Constants');
goog.require('app.Entity');
goog.require('app.shared.pools');


/**
 * Manages a chimney. A child entity of Building.
 * @constructor
 * @param {Game} game The game object.
 * @param {Element} chimneysElem DOM element that contains all chimneys.
 * @param {number} position The position of the chimney in the parent building.
 * @param {number} type Different types of chimney.
 */
app.Chimney = function(game, chimneysElem, position, type) {
  app.Entity.call(this);

  /** @type {Game} */
  this.game = game;

  /** @type {jQuery} */
  this.elem = $('<div class="chimney">');
  this.elem.addClass('position-' + position);
  this.elem.addClass('chimney-' + type);

  this.scoreElem = $('<div class="score score-' + type + ' hidden">');
  this.scoreElem.appendTo(this.elem);

  this.type = type;
  this.width = Constants.CHIMNEY_TYPES[String(this.type)]['width'];
  this.height = 1;

  /** @type {boolean} */
  this.dead = false;

  /** @type {boolean} */
  this.isHit = false;

  this.elem.appendTo(chimneysElem);
};

/**
 * Inherit from entity.
 */
app.Chimney.prototype = Object.create(app.Entity.prototype);

app.shared.pools.mixin(app.Chimney);

/**
 * Resets the item so it can be reused.
 */
app.Chimney.prototype.onInit = function() {
  this.elem.removeClass('hidden');
  this.scoreElem.removeClass('pop');
  this.scoreElem.addClass('hidden');
  this.dead = false;
  this.isHit = false;
};

/**
 * Removes this item from the game loop.
 */
app.Chimney.prototype.onDispose = function() {
  this.dead = true;
};

/**
 * Virtual method to update chimney for new frame.
 */
app.Chimney.prototype.onFrame = function() {};

/**
 * Registers a collision with the player.
 */
app.Chimney.prototype.hit = function() {
  this.isHit = true;

  this.scoreElem.removeClass('hidden');
  this.scoreElem.addClass('pop');

  this.game.caughtItem(this.type * (this.game.level + 1), 0);
  window.santaApp.fire('sound-trigger', 'glider_chimney_hit');
};
