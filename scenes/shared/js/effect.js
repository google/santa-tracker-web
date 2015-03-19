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


goog.provide('app.shared.Effect');

// We are *leaking* the Effect global for backwards compatibility.
app.shared.Effect = Effect;

/**
 * Creates some effect using css animations.
 * Adds animate class to element to activate animation.
 * @constructor
 * @param {!Game} game The current game object.
 * @param {!HTMLElement} elem The element for the effect.
 * @param {function} callback Called when animation is over.
 */
function Effect(game, elem, callback) {
  this.game = game;
  this.elem = elem;
  this.callback = callback;

  this.animateEnded_ = this.animateEnded_.bind(this);
};

/**
 * Animate the effect at a position.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 */
Effect.prototype.animate = function(x, y) {
  // Position
  this.elem.css({
    left: x,
    top: y
  }).removeClass('hidden');

  // Animate
  utils.animWithClass(this.elem, 'animate', this.animateEnded_, true);
};

/**
 * Hide effect when animation has finished.
 * @private
 */
Effect.prototype.animateEnded_ = function() {
  this.elem.addClass('hidden');
  if (this.callback) {
    this.callback.call(this);
  }
};
