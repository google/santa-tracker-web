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

goog.provide('app.Present');

goog.require('Constants');
goog.require('app.shared.pools');

/**
 * Drops a present.
 * @constructor
 * @param {Game} game The current game object.
 */
app.Present = function(game) {
  app.Entity.call(this);

  this.game = game;
  this.elem = $('<div class="present hidden" />');
  this.elem.addClass('present-' + Math.ceil(Math.random() * Constants.TOTAL_PRESENTS));
  game.presentsElem.append(this.elem);
};

/**
 * Inherit from entity.
 */
app.Present.prototype = Object.create(app.Entity.prototype);

app.shared.pools.mixin(app.Present);

/**
 * Resets the present for reuse.
 * @param {number} x screen position.
 * @param {number} y screen position.
 */
app.Present.prototype.onInit = function(x, y) {
  this.elem.removeClass('hidden');

  this.setPos(x, y);

  this.elem.css('transform', 'translate3d(' + this.x + 'em, ' + this.y + 'em, 0)');

  this.dead = false;

  // State
  this.velocity = Constants.PRESENT_INITIAL_VELOCITY;
};

/**
 * Remove present from pool.
 */
app.Present.prototype.remove = function() {
  this.elem.addClass('hidden');
  app.Present.push(this);
};

/**
 * Remove the present from the dom and game loop.
 */
app.Present.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Moves the present each frame.
 * @param  {number} delta Time since last frame.
 */
app.Present.prototype.onFrame = function(delta) {
  var lasty = this.screenY, present = this;

  // Calculate gravity
  if (this.screenY < this.game.sceneSize.height) {
    this.velocity += Constants.PRESENT_GRAVITY * delta;
    this.setY(this.y + this.velocity * delta);
    this.elem.css('transform', 'translate3d(' + this.x + 'em, ' + this.y + 'em, 0)');
  } else {
    present.remove();
  }

  // Collision detection
  this.checkCollisions_();
};

/**
 * Checks all chimney for collision with the oresebt. Uses very simple distance detection.
 * @private
 */
app.Present.prototype.checkCollisions_ = function() {
  var x = this.screenX,
      y = this.screenY,
      present = this;

  this.game.forEachActiveChimney(function(chimney) {
    if (
      x < chimney.screenX + chimney.width &&
      x + Constants.PRESENT.width > chimney.screenX &&
      y < chimney.screenY + chimney.height &&
      Constants.PRESENT.height + y > chimney.screenY
    ) {
      present.elem.addClass('hidden');
      present.remove();
      chimney.hit();
    }
  });
};
