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

goog.provide('app.Finish');

goog.require('Constants');

/**
 * Finish class
 * @param {Game} game The current game object.
 *
 * @constructor
 */
app.Finish = function(game) {
  this.game = game;
  this.elem = game.context.find('.finish');
  this.width = Constants.FINISH.width;
  this.height = Constants.FINISH.height;

  this.dead = false;
};

/**
 * Place the finish sign at the given position.
 * @param  {number} xPos Position to place the finish at.
 */
app.Finish.prototype.place = function(xPos) {
  this.x = xPos;
  this.dead = false;

  this.elem
      .css('transform', 'translate3d(' + this.x + 'px, 0, 0)');
  this.elem.removeClass('hidden');
};

/**
 * Checks if the finish has left the viewport.
 */
app.Finish.prototype.onFrame = function() {
  if (this.x < this.game.distanceTraveled - this.width) {
    this.dead = true;
  }
};

/**
 * Called when the finish is hit by the player.
 * @param  {app.Player} player The player.
 */
app.Finish.prototype.hit = function(player) {
  player.newState(Constants.REINDEER_STATE_JUMPING);
  player.ySpeed = Constants.REINDEER_FINISH_Y_SPEED;
};

/**
 * Get the current hitbox of the finish.
 * @return {Object} The hitbox.
 */
app.Finish.prototype.getHitbox = function() {
  return {
    x: this.x - this.game.distanceTraveled,
    y: -this.height,
    width: this.width,
    height: 0
  };
};
