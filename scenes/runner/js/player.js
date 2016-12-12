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
goog.require('app.shared.Coordinator');

/**
 * Player class.
 * @param {Game} game The current game object.
 * @param {Element} context Dom element wrapping the player.
 *
 * @constructor
 */
app.Player = function(game, context) {
  this.game = game;
  this.context = $(context);
  this.hitCloudElem = game.context.find('.hit-cloud');
  this.hitCloudInnerElem = game.context.find('.hit-cloud__inner');
  this.magnetElem = game.context.find('.magnet');

  this.state = Constants.REINDEER_STATE_RUNNING;
};

/**
 * Resets the player for a new game.
 */
app.Player.prototype.reset = function() {
  this.x = Constants.REINDEER_X_POS;
  this.y = 0;
  this.angle = 0;
  this.xSpeed = 0;
  this.ySpeed = 0;
  this.yAcceleration = 0;
  this.jumpsRequested = 0;
  this.jumpEndRequested = false;
  this.hasHitCloud = false;
  this.hasMagnet = false;

  this.newState(Constants.REINDEER_STATE_RUNNING, true);
  this.draw();
};

/**
 * Changes reindeer state.
 * @param {number} state The new state.
 * @param {boolean} opt_finishCollision Whether we are changing state because
 *                                      the collision state is ending.
 * @param {boolean} opt_falling Whether the reindeer is falling.
 */
app.Player.prototype.newState = function(state, opt_finishCollision,
    opt_falling) {
  if (this.state == Constants.REINDEER_STATE_COLLISION &&
      !opt_finishCollision) {
    return;
  }

  var prevState = this.state;
  this.state = state;

  this.context.removeClass(Constants.REINDEER_STATES[prevState].css)
      .addClass(Constants.REINDEER_STATES[this.state].css);

  if (state == Constants.REINDEER_STATE_RUNNING &&
      prevState !== Constants.REINDEER_STATE_RUNNING) {
    this.jumpsRequested = 0;
    this.jumpEndRequested = false;
  } else if (state == Constants.REINDEER_STATE_JUMP_START && !opt_falling) {
    if (this.jumpsRequested == 0) {
      window.santaApp.fire('sound-trigger', 'runner_jump_1');
    } else {
      window.santaApp.fire('sound-trigger', 'runner_jump_2');
    }
    this.yAcceleration = 0;
  } else if (state == Constants.REINDEER_STATE_COLLISION) {
    this.xSpeed = Constants.REINDEER_COLLISION_X_SPEED;
    this.ySpeed = Constants.REINDEER_COLLISION_Y_SPEED;

    this.hasHitCloud = true;
    this.drawHitcloud();
    this.hitCloudElem.removeClass('hidden');
    this.hitCloudInnerElem.addClass('hit-cloud__inner--active');

    Coordinator.after(Constants.REINDEER_HIT_CLOUD_DURATION_SEC, function() {
      this.hitCloudElem.addClass('hidden');
      this.hitCloudInnerElem.removeClass('hit-cloud__inner--active');
      this.hasHitCloud = false;
    }.bind(this));

    Coordinator.after(Constants.REINDEER_COLLISION_DURATION_SEC, function() {
      this.newState(Constants.REINDEER_STATE_RUNNING, true);
    }.bind(this));
  }
};

/**
 * Called when the user has pressed or swiped up.
 */
app.Player.prototype.onUp = function() {
  if (this.jumpsRequested < 2) {
    this.newState(Constants.REINDEER_STATE_JUMP_START);
    this.jumpsRequested++;
    this.jumpEndRequested = false;
  }
};

/**
 * Called when the user has pressed or swiped down.
 * @param {number} opt_duration Fixed duration for the slide (for mobile).
 */
app.Player.prototype.onDown = function(opt_duration) {
  if (this.state == Constants.REINDEER_STATE_RUNNING) {
    this.newState(Constants.REINDEER_STATE_SLIDING);
    if (opt_duration) {
      Coordinator.after(opt_duration, function() {
        this.endSlide();
      }.bind(this));
    }
  } else if (this.state == Constants.REINDEER_STATE_JUMPING &&
      !this.jumpEndRequested) {
    this.ySpeed += 500;
    this.jumpEndRequested = true;
  } else if (this.state == Constants.REINDEER_STATE_JUMP_START &&
      !this.jumpEndRequested) {
    this.newState(Constants.REINDEER_STATE_JUMPING);
    this.ySpeed += 500;
    this.jumpEndRequested = true;
  }
};

/**
 * Called when the user stops sliding.
 */
app.Player.prototype.endSlide = function() {
  if (this.state == Constants.REINDEER_STATE_SLIDING) {
    this.newState(Constants.REINDEER_STATE_RUNNING);
  }
};

/**
 * Updates the reindeer's position each frame and checks for collisions.
 * @param  {number} delta Time since last frame.
 */
app.Player.prototype.onFrame = function(delta) {
  var startY, endY;
  startY = endY = this.y;

  this.angle = Math.min(1,
      this.ySpeed / Math.abs(Constants.REINDEER_JUMP_SPEED)) * 15;

  if (this.state == Constants.REINDEER_STATE_JUMP_START) {
    this.yAcceleration += Constants.REINDEER_JUMP_ACCELERATION_STEP;
    this.ySpeed += this.yAcceleration;
    this.y += this.ySpeed * delta;
    endY = this.y;
    if (this.ySpeed <= Constants.REINDEER_JUMP_SPEED) {
      this.newState(Constants.REINDEER_STATE_JUMPING);
    }
  }

  if ((this.ySpeed || this.state == Constants.REINDEER_STATE_JUMPING) &&
      this.state != Constants.REINDEER_STATE_JUMP_START) {
    this.y += this.ySpeed * delta;
    this.ySpeed += Constants.REINDEER_GRAVITY * delta;

    if (this.y >= 0) {
      this.land_(0);
    }

    endY = this.y;
  }

  this.x += this.xSpeed * delta;
  if (this.state == Constants.REINDEER_STATE_COLLISION) {
    this.xSpeed = Math.min(0,
        this.xSpeed + Constants.REINDEER_COLLISION_X_FRICTION * delta);
  } else if (this.x < Constants.REINDEER_X_POS) {
    this.xSpeed += Constants.REINDEER_COLLISION_X_RECOVERY_SPEED * delta;
  } else {
    this.x = Constants.REINDEER_X_POS;
    this.xSpeed = 0;
  }
  this.draw();

  if (this.hasHitCloud) {
    this.drawHitcloud();
  }

  if (this.hasMagnet) {
    this.drawMagnet();
  }

  // Check collisions and platforms.
  var needsFall = this.y < 0 && this.ySpeed == 0;
  var platformFound = false;

  for (var i = 0, len = this.game.entities.length; i < len; i++) {
    var entity = this.game.entities[i];
    if ((entity instanceof app.Platform || entity instanceof app.Finish) &&
        !platformFound) {
      if (startY < endY) {
        platformFound = this.checkLandingPlatform_(entity, startY, endY);
      } else if (needsFall) {
        platformFound = this.checkSupportingPlatform_(entity, this.y);
        needsFall = !platformFound;
      }
    } else if (entity.getHitbox &&
        this.state !== Constants.REINDEER_STATE_COLLISION) {
      this.checkCollision_(entity);
    }
  }

  if (needsFall) {
    this.newState(Constants.REINDEER_STATE_JUMPING, false, true);
    this.ySpeed = Constants.REINDEER_FALL_SPEED;
  }

};

/**
 * Draw the reindeer.
 */
app.Player.prototype.draw = function() {
  this.context
      .css('transform', 'translate3d(' + (this.x - Constants.REINDEER_X_POS) +
          'px, ' + this.y + 'px, 0) rotateZ(' + this.angle + 'deg)');
};

/**
 * Draws hitcloud over the reindeer.
 */
app.Player.prototype.drawHitcloud = function() {
    var playerHitbox = this.getHitbox();
    var hitX = playerHitbox.x + playerHitbox.width / 2 -
        Constants.REINDEER_HIT_CLOUD_SIZE / 2;
    var hitY = playerHitbox.y - playerHitbox.height / 2 +
        Constants.REINDEER_HIT_CLOUD_SIZE / 2;

    this.hitCloudElem
      .css('transform', 'translate(' + hitX + 'px, ' +
          hitY + 'px) translateZ(0)');
};

/**
 * Draws a magnet behind the reindeer.
 */
app.Player.prototype.drawMagnet = function() {
    var playerHitbox = this.getHitbox();
    var magnetX = playerHitbox.x - 75;
    var magnetY = playerHitbox.y - playerHitbox.height / 2;

    this.magnetElem
      .css('transform', 'translate(' + magnetX + 'px, ' +
          magnetY + 'px) translateZ(0)');
};

/**
 * Show or hide the magnet
 * @param  {boolean} magnetOn Whether to turn the magnet on or off.
 */
app.Player.prototype.toggleMagnet = function(magnetOn) {
  if (magnetOn) {
    this.hasMagnet = true;
    this.magnetElem.addClass('magnet--active');
  } else {
    this.magnetElem.removeClass('magnet--active');
    Coordinator.after(Constants.MAGNET_ANIMATION_DURATION_SEC, function() {
      this.hasMagnet = false;
    }.bind(this));
  }
};

/**
 * Collision detection.
 * @param  {Object} entity The entity to check for collision.
 * @private
 */
app.Player.prototype.checkCollision_ = function(entity) {
  var entityHitbox = entity.getHitbox();
  var playerHitbox = this.getHitbox();

  if (!this.checkHorizontalHitbox_(entityHitbox)) {
    return;
  }

  // Check for vertical hit
  if (!(playerHitbox.y - playerHitbox.height > entityHitbox.y ||
      playerHitbox.y < entityHitbox.y - entityHitbox.height)) {
    entity.hit(this);
  }
};

/**
 * @param  {app.Platform} platform The Platform
 * @param  {number} startY The reindeer's y position at the start of the frame.
 * @param  {number} endY The reindeer's y position at the end of the frame.
 * @return {boolean} Whether the reindeer should land on this platform.
 * @private
 */
app.Player.prototype.checkLandingPlatform_ = function(platform, startY, endY) {
  if (!this.checkHorizontalHitbox_(platform.getHitbox())) {
    return false;
  }

  if (-platform.height <= endY && -platform.height > startY) {
    this.land_(-platform.height);
    platform.hit(this);
    this.draw();
    return true;
  }

  return false;
};

/**
 * @param  {app.Platform} platform The Platform
 * @param  {number} yPos The reindeer's y position.
 * @return {boolean} Whether the reindeer is being supported by this platform.
 * @private
 */
app.Player.prototype.checkSupportingPlatform_ = function(platform, yPos) {
  return (this.checkHorizontalHitbox_(platform.getHitbox()) &&
      -platform.height == yPos);
};

/**
 * Check an entity's hitbox for horizontal overlap with player.
 * @param  {Object} entityHitbox The entity's hitbox.
 * @return {boolean} Whether the hitboxes overlap.
 * @private
 */
app.Player.prototype.checkHorizontalHitbox_ = function(entityHitbox) {
  var playerHitbox = this.getHitbox();
  return !(entityHitbox.x + entityHitbox.width < playerHitbox.x ||
      entityHitbox.x >= playerHitbox.x + playerHitbox.width);
};

/**
 * Land the player at the given height.
 * @param  {number} yPos The height to land at.
 * @private
 */
app.Player.prototype.land_ = function(yPos) {
  this.y = yPos;
  this.ySpeed = 0;
  this.angle = 0;
  this.newState(Constants.REINDEER_STATE_RUNNING);
};

/**
 * @return {Object} The hitbox for the current state.
 */
app.Player.prototype.getHitbox = function() {
  var constants = Constants.REINDEER_STATES[this.state];
  return {
    x: this.x + constants.xOffset,
    y: this.y - constants.yOffset,
    width: constants.width,
    height: constants.height
  };
};
