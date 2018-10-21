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

goog.provide('app.shared.Overlay');

goog.require('app.shared.utils');

/**
 * Overlay.
 * @param {!Element|!jQuery} elem The overlay element.
 * @constructor
 */
app.shared.Overlay = function(elem) {
  this.elem = app.shared.utils.unwrapElement(elem);
}

/**
 * Shows the overlay with an animation from the game.
 */
app.shared.Overlay.prototype.show = function() {
  this.elem.classList.add('is-visible');
};

/**
 * Hides the overlay with an animation.
 * @param {function()=} opt_callback Runs when the animation is finished.
 */
app.shared.Overlay.prototype.hide = function(opt_callback) {
  var elem = this.elem;
  var handler = function() {
    elem.removeEventListener('animationend', handler);
    elem.classList.remove('is-visible');
    elem.classList.remove('is-closed');
    opt_callback && opt_callback();
  };
  elem.addEventListener('animationend', handler);
  elem.classList.add('is-closed');
};
