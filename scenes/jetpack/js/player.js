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

goog.require('app.Constants');
goog.require('app.DangerItem');



/**
 * The player entity.
 * @param {!Game} game The game object.
 * @param {!Element} elem DOM element containing the player.
 * @constructor
 */
app.Player = function(game, elem) {
  this.game = game;
  this.elem = $(elem).css({ left: '0', top: '0' });
  this.fireElem = this.elem.find('.fire');
  this.inputVector = { x: 0, y: 0 };
  this.velocity = { x: new utils.SmartValue(), y: new utils.SmartValue() };

  // Sound state
  this.soundPosition = new utils.SmartValue();
  this.soundVelocity = new utils.SmartValue();
  this.soundOutOfScreen = new utils.SmartValue();

  this.reset();
};


/**
 * Resets the player for a new game.
 */
app.Player.prototype.reset = function() {
  this.x = app.Constants.SCENE_WIDTH / 2;
  this.y = this.game.sceneSize.height * 0.75;
  this.velocity.x.value = 0;
  this.velocity.y.value = 0;
  this.shake = 0;
  this.isHit = false;
  this.hitDuration = 0;
  this.elem.removeClass('player--hit');

  // Sound state
  this.soundFrameCounter = 0;
  this.soundPosition.value = null;
  this.soundVelocity.value = null;
  this.soundOutOfScreen.value = false;

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
      minY = 70,
      maxY = this.game.sceneSize.height - 80,
      minX = (app.Constants.SCENE_WIDTH / 2) - (windowWidth / 2) + 58,
      maxX = minX + windowWidth - 58 * 2;

  if (this.y < minY) {
    isOutside = true;
    nInputY = 1;
  } else if (this.y > maxY) {
    isOutside = true;
    nInputY = -1;
  }
  if (this.x < minX) {
    isOutside = true;
    nInputX = 1;
  } else if (this.x > maxX) {
    isOutside = true;
    nInputX = -1;
  }

  if (this.isHit) {
    this.hitDuration += delta;
    nInputY = nInputX = 0;

    if (this.hitDuration >= app.Constants.PLAYER_HIT_DURATION) {
      this.isHit = false;
      this.hitDuration = 0;
      this.elem.removeClass('player--hit');
    }
  }

  if (this.soundOutOfScreen.change(isOutside)) {
    window.santaApp.fire('sound-trigger', isOutside ? 'jp_out_of_screen' : 'jp_back_to_screen');
  }

  // Update velocity
  this.velocity.x.moveToTarget(nInputX, delta * app.Constants.PLAYER_ACCELERATION);
  this.velocity.y.moveToTarget(nInputY, delta * app.Constants.PLAYER_ACCELERATION);

  // Update position
  this.x += this.velocity.x.value * app.Constants.PLAYER_MAX_SPEED * delta;
  this.y += this.velocity.y.value * app.Constants.PLAYER_MAX_SPEED * delta;

  // Add shake
  this.shake += delta;
  this.x += Math.sin(this.shake * 3) * 15 * delta;
  this.y += Math.sin(this.shake * 4) * 15 * delta;

  // Update rotation
  var rotation = this.velocity.x.value * app.Constants.PLAYER_MAX_ROTATION;
  var fireScale = Math.pow(app.Constants.PLAYER_MAX_FIRESCALE, -nInputY);

  // Update the DOM
  this.elem.css('transform',
      'translate3D(' + this.x + 'px,' + this.y + 'px,0) ' +
      'rotate(' + rotation + 'deg)');
  this.fireElem.css('transform', 'translateZ(0) scale(' + fireScale + ')');

  // See if we cought any items.
  this.checkCollisions_();

  // Update sound 20 times per second.
  if (this.soundFrameCounter === 0) {
    this.updateSound_();
  }
  this.soundFrameCounter = (this.soundFrameCounter + 1) % 3;
};


/**
 * Checks all items for collision with the player. Uses very simple distance detection.
 * @private
 */
app.Player.prototype.checkCollisions_ = function() {
  var x = this.x,
      y = this.y,
      this_ = this;

  this.game.forEachCollidable(function(item) {
    var deltaX = item.x - x,
        deltaY = item.y - y,
        distanceSq = deltaX * deltaX + deltaY * deltaY;

    if (distanceSq < app.Player.ITEM_MIN_DISTANCESQ_) {
      item.hit();

      if (item instanceof app.DangerItem) {
        this_.elem.addClass('player--hit');
        this_.isHit = true;
      }
    }
  });
};


/**
 * Updates player sounds by sends speed and position events to SCSound.
 * @private
 */
app.Player.prototype.updateSound_ = function() {
  var velocity = Math.sqrt((this.velocity.x.value * this.velocity.x.value) +
                           (this.velocity.y.value * this.velocity.y.value));
  if (this.soundVelocity.change(velocity)) {
    window.santaApp.fire('sound-trigger', {
      name: 'jp_player_moving',
      args: [velocity]
    });

  }

  var centerOffset = this.x - app.Constants.SCENE_WIDTH / 2;
  var panning = centerOffset / (this.game.sceneSize.width / 2);
  panning *= 0.85; // Provide some leg room for player going out of bounds.
  if (this.soundPosition.change(panning)) {
    window.santaApp.fire('sound-trigger', {
      name: 'jp_player_position',
      args: [panning]
    });
  }
};


/**
 * @const
 * @private
 */
app.Player.ITEM_MIN_DISTANCESQ_ = app.Constants.ITEM_MIN_DISTANCE * app.Constants.ITEM_MIN_DISTANCE;
