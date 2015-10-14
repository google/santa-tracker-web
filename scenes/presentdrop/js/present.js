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

goog.require('app.shared.pools');

/**
 * Drops a present.
 * @constructor
 * @struct
 * @param {!app.Game} game The current game object.
 */
app.Present = function(game) {
  this.game = game;
  this.elem = $('<div class="present hidden" />');
  game.presentsElem.append(this.elem);

  this.dead = false;
  this.x = 0;
  this.y = 0;
  this.velocity = 0;
};

app.shared.pools.mixin(app.Present);

/**
 * Resets the present for reuse.
 * @param {number} x The X position.
 */
app.Present.prototype.onInit = function(x) {
  this.elem.removeClass('hidden');
  this.dead = false;

  // State
  this.x = x - app.Present.PRESENT_CENTER;
  this.y = app.Constants.PRESENT_START_Y;
  this.velocity = app.Constants.PRESENT_INITIAL_VELOCITY;
  this.elem.css('left', this.x + 'px');
  this.draw();
};

/**
 * Remove present from pool.
 */
app.Present.prototype.remove = function() {
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
 * Position the present.
 */
app.Present.prototype.draw = function() {
  this.elem.css('top', this.y + 'px');
};

/**
 * Moves the present each frame.
 * @param {number} delta time in seconds since last frame.
 */
app.Present.prototype.onFrame = function(delta) {
  var lasty = this.y;

  // Calculate gravity
  if (this.y < app.Constants.PRESENT_END_Y) {
    this.velocity += app.Constants.PRESENT_GRAVITY * delta;
    this.y += this.velocity * delta;
    if (this.y > app.Constants.PRESENT_END_Y) {
      this.y = app.Constants.PRESENT_END_Y;
    }
  } else {
    this.remove();
    window.santaApp.fire('sound-trigger', 'pd_item_miss');
  }

  // Collision detection
  this.game.forEachActiveChimney(function(chimney) {
    var hitbox = chimney.getHitbox();

    // Check vertical hit
    if (hitbox.y <= lasty || hitbox.y >= this.y) {
      return;
    }

    // Check for horizontal hit
    var diff = Math.abs(this.x - hitbox.x - hitbox.center);

    if (diff <= hitbox.center - app.Present.PRESENT_CENTER) {
      // Hits inside chimney.
      this.remove();
      chimney.hit();

    } else if (diff < hitbox.center + app.Present.PRESENT_CENTER) {
      // Hits on edge. Should bounce away?
      this.remove();
      chimney.hit();
    }
  }, this);

  this.draw();
};

/**
 * Drop a present.
 * @param {number} x The x location of the present.
 */
app.Present.prototype.drop = function(x) {
  this.elem.addClass('drop');
  this.elem.css({left: (x - app.Present.PRESENT_CENTER) + 'px'});
  this.elem.appendTo(this.elem.closest('.stage').find('.presents'));
};

/** @const */
app.Present.PRESENT_CENTER = app.Constants.PRESENT_WIDTH / 2;
