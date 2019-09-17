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

goog.provide('app.Penguin');

goog.require('app.Constants');

/**
 * Constructor for scoring items that the player can catch.
 * @constructor
 * @extends {Item}
 * @param {!Game} game The game object.
 */
app.Penguin = function(parent) {
  this.game = parent;
  this.elem = parent.add.sprite('-200', '-200', 'sprite-penguin');
  this.shadow = this.elem.addChild(parent.make.sprite(0, 6, 'shadow-penguin'));
  this.dust = this.elem.addChild(parent.make.sprite(-30, 0, 'sprite-dust'));

  this.shadow.anchor.set(0.4, 0.5);

  this.dust.anchor.set(0.4, 0.5);
  this.dust.animations.add('default');
  this.dust.animations.play('default', 12, true);
  this.dust.alpha = 0;
  this.dust.tint = 0xdbd8ce;

  this.elem.animations.add('slide', [0], false);
  this.elem.animations.add('accelerating',
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2], 12, true);
  this.elem.animations.add('falling',
      [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 12, false);
  this.elem.animations.add('celebrating',
      [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31], 12, false);
  parent.physics.enable(this.elem, Phaser.Physics.ARCADE);
  this.elem.allowGravity = false;
  this.elem.anchor.set(0.4, 0.5);
  this.elem.angle = 90;
  this.elem.body.setSize(66, 66);
  this.elem.body.offset.x = 27;
  this.elem.body.offset.y = 25;
  this.elem.body.bounce.set(0.3, 0.3);
  this.elem.body.collideWorldBounds = true;
  this.elem.bringToTop();

  this.slide();
};

/**
 * Adjust angle penguin is pointing.
 */
app.Penguin.prototype.adjustAngle = function() {
  if (this.elem.body.velocity.x !== 0 || this.elem.body.velocity.y !== 0) {
    let theta = Math.atan2(
        this.elem.body.velocity.y,
        this.elem.body.velocity.x);
    theta *= 180 / Math.PI;

    let shortestAngle = this.game.math.getShortestAngle(theta, this.elem.angle) * -1;
    this.elem.angle += shortestAngle / 8;

    this.shadow.x = -Math.cos(this.elem.angle * Math.PI / 180)*6;
    this.shadow.y = Math.sin(this.elem.angle * Math.PI / 180)*6;
  }
};


/**
 * Center penguin in cell.
 * @param {!Phaser.element} first Phaser element to center in.
 */
app.Penguin.prototype.centerInElement = function(first) {
  let center = {x: first.x + first.width / 2, y: first.y + first.height / 2};
  this.elem.x = center.x;
  this.elem.y = center.y;
};


/**
 * Incrementally change velocity.
 * @param {float} percent Percent of velocity change.
 */
app.Penguin.prototype.multiplyVelocity = function(percent) {
  this.elem.body.velocity.x = this.elem.body.velocity.x * percent;
  this.elem.body.velocity.y = this.elem.body.velocity.y * percent;
};


/**
 * Play die animation.
 */
app.Penguin.prototype.die = function() {
  this.dustAlpha(0);
  this.state = app.Constants.PENGUIN_STATES.falling;
  this.shadow.alpha = 0;
  this.elem.animations.play('falling');
  this.elem.sendToBack();
};

/**
 * Play accelerating animation.
 */
app.Penguin.prototype.boost = function() {
  if (this.state != app.Constants.PENGUIN_STATES.accelerating) {
    this.state = app.Constants.PENGUIN_STATES.accelerating;
    this.elem.animations.play('accelerating');
  }
};

/**
 * Play slide state.
 */
app.Penguin.prototype.slide = function() {
  this.state = app.Constants.PENGUIN_STATES.sliding;
  this.elem.animations.play('slide');
};

/**
 * Play slide state.
 */
app.Penguin.prototype.dustAlpha = function(alpha) {
  this.dust.alpha = alpha;
};


/**
 * Reset penguin movement.
 */
app.Penguin.prototype.reset = function() {
  this.elem.body.velocity.x = 0;
  this.elem.body.velocity.y = 0;
  this.shadow.alpha = 1;
  this.slide();
  this.elem.bringToTop();
};