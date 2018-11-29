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

goog.provide('app.Cloud');

goog.require('app.shared.pools');



/**
 * Manages a cloud. It appears randomly across the whole screen, in 3 different
 * sizes and moves in different speeds down the screen.
 * @param {!Game} game The game object.
 * @constructor
 */
app.Cloud = function(game) {
  /** @type {Game} */
  this.game = game;

  /** @type {jQuery} */
  this.elem = $('<div class="cloud hidden"></div>');

  /** @type {boolean} */
  this.dead = false;

  /**
   * Size of the cloud in % of original. Used in transformation.
   * @type {number}
   */
  this.size = 1;

  /**
   * Speed in pixels.
   * @type {number}
   */
  this.speed = 120;

  /** @type {number} */
  this.y = -150;

  this.game.cloudsElem.append(this.elem);
};

app.shared.pools.mixin(app.Cloud);


/**
 * Resets the cloud so it can be reused.
 */
app.Cloud.prototype.onInit = function() {
  this.elem.removeClass('hidden');
  this.dead = false;

  /** 0-2, three different sizes/speeds */
  var type = Math.floor(Math.random() * 3);

  this.size = 1 - type * 0.25;
  this.speed = 120 - type * 30;
  this.y = -150;

  this.elem.css('left', Math.random() * this.game.sceneSize.width);
};


/**
 * Updates the cloud
 * @param {number} delta Seconds since last frame.
 */
app.Cloud.prototype.onFrame = function(delta) {
  this.y += this.speed * delta;

  if (this.y < this.game.sceneSize.height + 150) {
    this.elem.css('transform', 'translate3d(0,' + this.y + 'px,0) scale(' + this.size + ')');
  } else {
    this.remove();
  }
};


/**
 * Removes this cloud from the game loop.
 */
app.Cloud.prototype.onDispose = function() {
  this.elem.css('transform', '');
  this.elem.addClass('hidden');
  this.dead = true;
};
