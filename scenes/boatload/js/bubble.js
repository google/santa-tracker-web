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

goog.provide('Bubble');

goog.require('app.shared.pools');

/**
 * Bubbles from the motors of the boats.
 * @param {Game} game The game object.
 * @constructor
 */
Bubble = function(game) {
  this.game = game;
  this.elem = $('<div class="bubble hidden"></div>');
  this.elem[0].bubble = this;

  var type = Math.ceil(Math.random() * 6);
  this.elem.addClass('bubble--' + type);
  this.game.bubblesElem.append(this.elem);
};

pools.mixin(Bubble);

/**
 * Initialize bubble for reuse.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 * @param {number} speed The speed of the animation.
 */
Bubble.prototype.onInit = function(x, y, speed) {
  this.elem.addClass('animate').css({
    animation: 'bubble-left ' + speed / 12 * 1000 + 'ms',
    top: y,
    left: x,
    opacity: 0
  }).removeClass('hidden');
};

/**
 * Remove bubble.
 */
Bubble.prototype.onDispose = function() {
  this.elem.addClass('hidden').removeClass('animate').css({
    top: -100,
    animation: '',
    opacity: 1
  });
};
