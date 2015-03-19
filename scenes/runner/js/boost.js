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

goog.provide('app.Boost');

goog.require('Constants');
goog.require('app.shared.Coordinator');
goog.require('app.shared.pools');

/**
 * Boost class.
 * @param {Game} game The current game object.
 *
 * @constructor
 */
app.Boost = function(game) {
  this.game = game;
  this.boostsElem = game.context.find('.boosts');
  this.elem = $('<div class="boost-wrap hidden"><div class="boost">' +
    '<div class="boost__inner-bg"></div><div class="boost__inner">' +
    '</div></div><div class="boost-text"></div></div>');
  this.boostElem = this.elem.find('.boost');
  this.boostTextElem = this.elem.find('.boost-text');

  this.boostsElem.append(this.elem);

  this.width = Constants.BOOST_SIZE;
  this.height = Constants.BOOST_SIZE;
};

/**
 * Create pool for boosts.
 */
app.shared.pools.mixin(app.Boost);

/**
 * Reset the boost for reuse.
 * @param  {number} startX Initial position to place the boost at.
 * @param  {number} startY  The height to place this boost at.
 */
app.Boost.prototype.onInit = function(startX, startY) {
  this.elem.removeClass().addClass('boost-wrap');
  this.boostElem.removeClass('boost--collected');
  this.boostTextElem.removeClass('boost-text--collected');
  this.dead = false;
  this.collected = false;

  var type = Constants.BOOSTS[Math.floor(Math.random() *
      Constants.BOOSTS.length)];

  this.elem.addClass(type.css);
  if (type.text) {
    this.boostTextElem.text(type.text);
  } else {
    this.boostTextElem.empty();
  }
  this.boostType = type.boostType;
  this.x = startX;
  this.y = -startY - this.height / 2;

  this.draw();
};

/**
 * Remove the boost from the game loop and hide it.
 */
app.Boost.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Checks if the boost is still in view.
 */
app.Boost.prototype.onFrame = function() {
  if (this.x < this.game.distanceTraveled - this.width) {
    app.Boost.push(this);
  }
};

/**
 * Called when the boost is hit by the player.
 */
app.Boost.prototype.hit = function() {
  if (!this.collected) {
    this.collected = true;
    this.boostElem.addClass('boost--collected');
    this.boostTextElem.addClass('boost-text--collected');
    window.santaApp.fire('sound-trigger', 'runner_present');

    switch (this.boostType) {
      case Constants.BOOST_TYPE_TIME:
        this.game.addTime(10);
        break;
      case Constants.BOOST_TYPE_MAGNET:
        this.game.magnetMode = true;
        this.game.player.toggleMagnet(true);
        Coordinator.after(Constants.MAGNET_DURATION_SEC, function() {
          this.game.magnetMode = false;
          this.game.player.toggleMagnet(false);
        }.bind(this));
        break;
    }
  }
};

/**
 * Draw the boost.
 */
app.Boost.prototype.draw = function() {
  this.elem
      .css('transform', 'translate3d(' + this.x + 'px, ' +
          this.y + 'px, 0)');
};

/**
 * Get the current hitbox of the boost.
 * @return {Object} The hitbox.
 */
app.Boost.prototype.getHitbox = function() {
  return {
    x: this.x - this.game.distanceTraveled,
    y: this.y,
    width: this.width,
    height: this.height
  };
};
