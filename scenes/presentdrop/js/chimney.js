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

goog.require('app.shared.pools');

/**
 * Manages a chimney.
 * @constructor
 * @param {!app.Game} game The current game object.
 */
app.Chimney = function(game) {
  this.game = game;
  this.elem = $('<div class="train hidden">' +
      '<div class="flag"><div class="flag-stick"/><div class="flag-score"/></div>' +
      '<div class="handle" />' +
      '<div class="hand" />' +
      '<div class="chimney" />' +
      '<div class="wheel1" />' +
      '<div class="wheel2" /></div>');
  game.chimneysElem.append(this.elem);
};

app.shared.pools.mixin(app.Chimney);

/**
 * Resets the chimney for reuse.
 */
app.Chimney.prototype.onInit = function() {
  this.elem.removeClass('hidden hit');
  this.dead = false;
  this.hits = 0;

  this.x = app.Constants.CHIMNEY_START_X;
  if (Math.random() < 0.5) {
    this.elem.addClass('large');
    this.isLarge = true;
  }

  this.draw();
};

/**
 * Add instance back to pool.
 */
app.Chimney.prototype.remove = function() {
  app.Chimney.push(this);
};

/**
 * Remove this chimney from dom and game loop.
 */
app.Chimney.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Position the chimney.
 */
app.Chimney.prototype.draw = function() {
  this.elem.css('transform', 'translateX(' + this.x + 'px) translateZ(0)');
};

/**
 * Update this chimney by delta every frame.
 * @param {number} delta Seconds since last onFrame.
 */
app.Chimney.prototype.onFrame = function(delta) {
  var speed = this.game.chimneySpeed;
  this.x -= speed * delta;

  if (this.x > app.Constants.CHIMNEY_END_X) {
    this.draw();
  } else {
    this.remove();
  }
};

/**
 * Registers a collision with the chimney.
 */
app.Chimney.prototype.hit = function() {
  this.hits++;

  var score = app.Chimney.calculateScore_(this.game.level, this.isLarge, this.hits);
  this.elem.find('.flag-score').text(score);
  this.elem.addClass('hit');
  this.game.hitChimney(score);
  this.hitTimer && window.clearTimeout(this.hitTimer);
  this.hitTimer = window.setTimeout(function() {
    this.elem.removeClass('hit');
  }.bind(this), app.Constants.CHIMNEY_FLAG_VISIBLE);
};

/**
 * Calculate score depending on chimney type and level number.
 * @param {number} level The current level, 0-based.
 * @param {boolean} isLarge Calculate score for large or small chimney.
 * @param {number} hits app.Chimney hit count.
 * @return {number} The score received.
 * @private
 */
app.Chimney.calculateScore_ = function(level, isLarge, hits) {
  var baseScore = app.Constants['SCORE_CHIMNEY_' + (isLarge ? 'LARGE' : 'SMALL')];
  return (baseScore + level * baseScore) * Math.pow(2, hits);
};

/**
 * Get the current hitbox of the chimney.
 * @return {{x: number, y: number, center: number}} The hitbox.
 */
app.Chimney.prototype.getHitbox = function() {
  if (this.isLarge) {
     return {
      center: app.Constants.CHIMNEY_WIDTH_LARGE / 2,
      y: app.Constants.CHIMNEY_Y_LARGE,
      x: this.x + 25
    };
  } else {
    return {
      center: app.Constants.CHIMNEY_WIDTH_SMALL / 2,
      y: app.Constants.CHIMNEY_Y_SMALL,
      x: this.x + 35
    };
  }
};
