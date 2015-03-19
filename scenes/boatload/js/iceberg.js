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

goog.provide('Iceberg');

goog.require('app.shared.pools');

/**
 * Manages an iceberg.
 * @constructor
 * @param {Game} game The current game object.
 */
Iceberg = function(game) {
  this.game = game;
  this.elem = $('<div class="iceberg hidden"></div>');
  this.game.icebergsElem.append(this.elem);
}

/**
 * Add methods for reusing objects.
 */
pools.mixin(Iceberg);

/**
 * Resets the Iceberg for reuse.
 * @param {number} type The type of the iceberg.
 * @param {number} x The X position.
 */
Iceberg.prototype.onInit = function(type, x) {
  var classes = 'hidden hit iceberg--1 iceberg--2 iceberg--3 ' +
        'iceberg--4 iceberg--5 iceberg--6';

  this.elem.removeClass(classes).addClass(type.css);
  this.dead = false;

  this.height = type.height;
  this.width = type.width;
  this.speed = type.speed;

  this.y = 0;
  this.x = x;

  this.presents = [];

  this.elem.css({
    top: -this.height,
    left: this.x,
    height: this.height,
    width: this.width
  });

  this.draw();
};

/**
 * Remove this Iceberg from game loop and hide it.
 */
Iceberg.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;

  if (this.presents.length) {
    for (var i = 0; i < this.presents.length; i++) {
      Present.push(this.presents[i]);
    }
    this.presents = [];
  }
};

/**
 * Position the iceberg.
 */
Iceberg.prototype.draw = function() {
  this.elem.css('transform', 'translateY(' + this.y + 'px) translateZ(0)');
};

/**
 * Update this Iceberg by delta every frame.
 * @param {number} delta Seconds since last onFrame.
 */
Iceberg.prototype.onFrame = function(delta) {
  var speed = this.game.icebergSpeed * this.speed * delta;
  this.y += speed;

  if (this.y < this.game.sceneSize.height + this.height) {
    this.draw();
  } else {
    Iceberg.push(this);
  }

  if (this.presents.length) {
    for (var i = 0; i < this.presents.length; i++) {
      this.presents[i].y += speed;
      this.presents[i].draw();
    }
  }
};

/**
 * Registers a collision with the Iceberg.
 * @param {Present} present The present.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 */
Iceberg.prototype.hit = function(present, x, y) {
  present.dead = true;
  window.santaApp.fire('sound-trigger', 'bl_hit_ice');

  this.presents.push(present);
};

/**
 * Get the current hitbox of the Iceberg.
 * @return {{x: number, y: number, center: number}} The hitbox.
 */
Iceberg.prototype.getHitbox = function() {
  return {
    center: this.height / 2 - 20,
    y: this.y - this.height + 10,
    x: this.x + (this.width / 2) - 5
  };
};
