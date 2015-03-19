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

goog.provide('app.Collision');

goog.require('Constants');
goog.require('app.Entity');
goog.require('app.shared.pools');

/**
 * Creates a collision cloud.
 * @constructor
 * @param {Game} game The current game object.
 */
app.Collision = function(game) {
  app.Entity.call(this);

  this.game = game;
  this.elem = $('<div class="collision hidden" />');
  this.animationElem = $('<div class="hit-cloud" />');
  this.animationElem.appendTo(this.elem);

  game.collisionsElem.append(this.elem);
};

/**
 * Inherit from entity.
 */
app.Collision.prototype = Object.create(app.Entity.prototype);

app.shared.pools.mixin(app.Collision);

/**
 * Resets the collision for reuse.
 * @param {number} x screen position.
 * @param {number} y screen position.
 */
app.Collision.prototype.onInit = function(x, y) {
  var self = this;
  this.elem.removeClass('hidden');
  this.setPos(x + 5, y + 2);
  this.elem.css('transform', 'translate3d(' + this.x + 'em, ' + this.y + 'em, 0)');
  this.animationElem.addClass('active');
  this.animationElem.off();
  this.animationElem.one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function() {
    self.animationElem.removeClass('active');
    self.remove();
  });

  this.dead = false;
};

/**
 * Remove present from pool.
 */
app.Collision.prototype.remove = function() {
  app.Collision.push(this);
};

/**
 * Remove the present from the dom and game loop.
 */
app.Collision.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Virtual method to update collision for new frame.
 */
app.Collision.prototype.onFrame = function() {};
