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

goog.provide('app.Player');

goog.require('Constants');
goog.require('app.Entity');
goog.require('app.shared.utils');
goog.require('app.utils');

/**
 * The player entity.
 * @param {Game} game The game object.
 * @param {elem} elem The player's DOM element.
 * @constructor
 */
app.Player = function(game, elem) {
  app.Entity.call(this);

  this.game = game;
  this.elem = $(elem).css({ left: '0', top: '0' });
  this.inputVector = { x: 0, y: 0 };
  this.velocity = { x: new utils.SmartValue(), y: new utils.SmartValue() };
  this.hasPresent = true;
  this.isHit = false;

  this.elem.addClass('animated');

  this.reset();
};

/**
 * Inherit from entity.
 */
app.Player.prototype = Object.create(app.Entity.prototype);

/**
 * Resets the player for a new game.
 */
app.Player.prototype.reset = function() {
  this.setPos(0, this.game.sceneSize.height * 0.5);
  this.velocity.x.value = 0;
  this.velocity.y.value = 0;
  this.shake = 0;

  app.utils.restartAnimation();
  this.onFrame(0);
};

/**
 * Update the player each frame by delta.
 * @param {number} delta Seconds since last onFrame.
 */
app.Player.prototype.onFrame = function(delta) {
  var nInputX = this.inputVector.x,
      nInputY = this.inputVector.y;

  // Check scene boundaries.
  var windowWidth = this.game.sceneSize.width,
      isOutside = false,
      minY = 0,
      maxY = this.game.sceneSize.height - Constants.PLAYER.height,
      minX = 0,
      maxX = windowWidth - Constants.PLAYER.width;
  if (this.screenY < minY) {
    isOutside = true;
    nInputY = 1;
  } else if (this.screenY > maxY) {
    isOutside = true;
    nInputY = -1;
  }
  if (this.screenX < minX) {
    isOutside = true;
    nInputX = 1;
  } else if (this.screenX > maxX) {
    isOutside = true;
    nInputX = -1;
  }

  // Update velocity
  this.velocity.x.moveToTarget(nInputX, delta * Constants.PLAYER_ACCELERATION);
  this.velocity.y.moveToTarget(nInputY, delta * Constants.PLAYER_ACCELERATION);

  // Update position with velocity and shake
  var velDeltaX = this.velocity.x.value * Constants.PLAYER_MAX_SPEED * delta;
  var velDeltaY = this.velocity.y.value * Constants.PLAYER_MAX_SPEED * delta;

  this.shake += delta;
  var shakeDeltaX = Math.sin(this.shake * 3) * delta;
  var shakeDeltaY = Math.sin(this.shake * 4) * delta;

  this.setPos(this.x + velDeltaX + shakeDeltaX, this.y + velDeltaY + shakeDeltaY);

  // Update rotation
  var rotation = this.velocity.y.value * Constants.PLAYER_MAX_ROTATION;

  // Update the DOM
  this.elem.css('transform',
                'translate3D(' + this.x + 'em, ' + this.y + 'em, 0) rotate(' + rotation + 'deg)');

  // See if we cought any items.
  this.checkCollisions_();
};

/**
 * Register a collision with an obstacle
 */
app.Player.prototype.hit = function() {
  if (!this.isHit) {
    var self = this,
        player = this.elem;
    this.isHit = true;
    player.addClass('pulse crash');
    this.game.createCollision(this.screenX, this.screenY);
    setTimeout(function() {
      player.removeClass('crash');
    }, 700);
    setTimeout(function() {
      self.isHit = false;
      player.removeClass('pulse');
    }, Constants.PLAYER_PULSE_TIME * 1000);
  }
};

/**
 * Checks all items/obstacles for collision with the player. Uses very simple distance detection.
 * @private
 */
app.Player.prototype.checkCollisions_ = function() {
  if (!this.isHit) {
    var x = this.screenX + 5, // for the left gap
        y = this.screenY + 5; // for the top gap

    this.game.forEachCollidable(function(object) {
      object.yVariance = object.yVariance || 0;

      if (
        x < object.screenX + object.xgap + object.width &&
        x + Constants.PLAYER.width > object.screenX + object.xgap &&
        y < object.screenY + object.ygap + object.yVariance + object.height &&
        Constants.PLAYER.height + y > object.screenY + object.ygap + object.yVariance
      ) {
        object.hit();
      }
    });
  }
};

/**
 * Drop a present.
 */
app.Player.prototype.dropPresent = function() {
  if (!this.hasPresent)
    return;

  var elem = this.elem,
      self = this;

  this.hasPresent = false;

  elem.addClass('drop');
  window.santaApp.fire('sound-trigger', 'glider_presentdrop');
  setTimeout(function() {
    elem.removeClass('drop');
    self.game.createPresent(self.screenX + Constants.PLAYER_PRESENT_X,
                            self.screenY + Constants.PLAYER_PRESENT_Y);
  }, 200);
  setTimeout(function() {
    self.hasPresent = true;
  }, Constants.TIME_BETWEEN_PRESENTS * 1000);
};
