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

goog.provide('app.Goal');

goog.require('app.Constants');



/**
 * The goal
 * @param {!Element} elem The goal object
 * @param {!Game} game The game object.
 * @constructor
 */
app.Goal = function(elem, game) {
  this.elem = elem;
  this.game = game;
  this.reset();
};

/**
 * Bottom Padding Percentage
 * @type {number}
 * @private
 */
app.Goal.PADDING_ = 10;


/**
 * Reinitialize goal
 */
app.Goal.prototype.reset = function() {
  this.elem.attr('style', '').addClass('goal--hidden');
};


/**
 * Show the goal.
 */
app.Goal.prototype.transition = function() {
  var yPosition = this.game.sceneSize.height -
      this.elem.height() -
      this.game.sceneSize.height * app.Goal.PADDING_ / 100;

  this.elem
    .removeClass('goal--hidden')
    .css('transform', 'translate3d(0, ' + yPosition + 'px, 0)');

  window.setTimeout(function() {
    this.game.gameover();
  }.bind(this), app.Constants.GOAL_DURATION * 1000);
};
