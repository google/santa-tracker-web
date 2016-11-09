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

goog.require('app.PlayerSound');
goog.require('goog.style');

/**
 * Represents the maze player object.
 * @param {!Element} el root <g> for the player.
 * @param {!app.Map} map where player can move.
 * @constructor
 */
app.Player = function(el, map) {
  this.direction = 0;
  this.el = el;
  this.rotationEl = el.querySelector('.player__rotation');
  this.spriteEl = el.querySelector('.player__elf-sprite');
  this.victoryEl = el.querySelector('.player__victory');
  this.lostEl = el.querySelector('.player__lost');
  this.isLost = false;
  this.level = null;
  this.map = map;
  this.startDirection = 0;
  this.x = 0;
  this.y = 0;

  this.render_();
};

/**
 * How long should it take to move one cell in ms.
 * @type {number}
 */
app.Player.MOVE_DURATION = 400;

/**
 * How long should it take to rotate in ms.
 * @type {number}
 */
app.Player.ROTATE_DURATION = 200;

app.Player.prototype = {
  setLevel: function(level) {
    // Save starting direction if we're starting.
    this.startDirection = this.direction;
    this.level = level;

    this.restartLevel();

    this.render_();
  },

  restartLevel: function() {
    this.direction = this.startDirection;
    this.x = this.level.playerX;
    this.y = this.level.playerY;
  },

  render_: function() {
    goog.style.setStyle(this.el, 'transform', this.getTranslation_(this.x, this.y));
    goog.style.setStyle(this.rotationEl, 'transform', 'rotate(' + this.direction + 'deg)');
  },

  /**
   * Moves the player in an absolute direction.
   * @param {app.Direction} direction to go in.
   * @return {boolean} true if successful, false if blocked for any reason.
   */
  move: function(direction) {
    var oldDirection = this.direction;
    var oldX = this.x;
    var oldY = this.y;

    var radDirection = direction / 180 * Math.PI;
    var newX = this.x + Math.round(Math.sin(radDirection));
    var newY = this.y - Math.round(Math.cos(radDirection));
    var tile = this.map.getTile(newX, newY);
    if (tile === app.TileType.TREE || this.level.isOutsideBounds(newX, newY)) {
      return;
    }
    this.direction = direction;
    this.x = newX;
    this.y = newY;

    // Wrap the outer animation in a SequenceEffect. Without this, the actual
    // relevant inner KeyframeEffect tends to get nuked by neighbour anims.
    var animation = new SequenceEffect([
      app.PlayerSound.walk(),
      new GroupEffect([
        this.walkAnimation_(),
        new KeyframeEffect(this.el, [
          {transform: this.getTranslation_(oldX, oldY)},
          {transform: this.getTranslation_(this.x, this.y)}
        ], {duration: app.Player.MOVE_DURATION, fill: 'forwards'})
      ], {duration: app.Player.MOVE_DURATION})
    ], {duration: app.Player.MOVE_DURATION});
    return this.maybeRotateAnimation_(animation, oldDirection);
  },

  /**
   * Moves the player in an absolute direction by X tiles ignoring obstacles.
   * @param {number} length How many blocks to jump over.
   * @param {app.Direction} direction to go in.
   * @return {boolean} true if successful, false if blocked for any reason.
   */
  jump: function(length, direction) {
    length = length + 1;   // Jump length + landing tile.
    var oldX = this.x;
    var oldY = this.y;
    var radDirection = direction / 180 * Math.PI;
    var newX = this.x + Math.round(Math.sin(radDirection)) * length;
    var newY = this.y - Math.round(Math.cos(radDirection)) * length;

    var tile = this.map.getTile(newX, newY);
    if (tile === app.TileType.TREE || this.level.isOutsideBounds(newX, newY)) {
      return;
    }
    this.direction = direction;
    this.x = newX;
    this.y = newY;

    // Wrap the outer animation in a SequenceEffect. Without this, the actual
    // relevant inner KeyframeEffect tends to get nuked by neighbour anims.
    var animation = new SequenceEffect([
      app.PlayerSound.walk(),
      new GroupEffect([
        this.jumpAnimation_(),
        new KeyframeEffect(this.el, [
          {transform: this.getTranslation_(oldX, oldY)},
          {transform: this.getTranslation_(this.x, this.y)}
        ], {duration: app.Player.MOVE_DURATION, fill: 'forwards'})
      ], {duration: app.Player.MOVE_DURATION})
    ], {duration: app.Player.MOVE_DURATION});
    return animation;
  },

  lose: function(direction) {
    var animation = new GroupEffect([
      app.PlayerSound.lost(),
      new KeyframeEffect(this.lostEl, [
        {opacity: 0, transform: 'scale(0.5)'},
        {opacity: 1, transform: 'scale(1)', offset: 0.3},
        {opacity: 1, transform: 'scale(1)'}
      ], {duration: 800, fill: 'forwards'})
    ], {fill: 'forwards'});

    if (direction != null) {
      var oldDirection = this.direction;
      this.direction = direction;

      var radDirection = direction / 180 * Math.PI;
      var newX = this.x + Math.round(Math.sin(radDirection)) * 0.2;
      var newY = this.y - Math.round(Math.cos(radDirection)) * 0.2;

      animation = new SequenceEffect([
        new KeyframeEffect(this.el, [
          {transform: this.getTranslation_(this.x, this.y)},
          {transform: this.getTranslation_(newX, newY)},
          {transform: this.getTranslation_(this.x, this.y)}
        ], {duration: app.Player.MOVE_DURATION * 0.4}),
        animation
      ], {fill: 'forwards'});
      animation = this.maybeRotateAnimation_(animation, oldDirection);
    }

    return animation;
  },

  maybeRotateAnimation_: function(animation, oldDirection) {
    if (oldDirection === this.direction) {
      return animation;
    }

    // WA-full does not figure out the shortest rotation.
    if (oldDirection < this.direction && this.direction - oldDirection > 180) {
      oldDirection += 360;
    } else if (oldDirection > this.direction && oldDirection - this.direction > 180) {
      oldDirection -= 360;
    }

    return new SequenceEffect([
      new GroupEffect([
        app.PlayerSound.stop(),
        new KeyframeEffect(this.rotationEl, [
          {transform: 'translateZ(0) rotate(' + oldDirection + 'deg)'},
          {transform: 'translateZ(0) rotate(' + this.direction + 'deg)'}
        ], {duration: app.Player.ROTATE_DURATION, fill: 'forwards'})
      ], {fill: 'forwards'}),
      animation
    ], {fill: 'forwards'});
  },

  pickUp: function(present) {
    return new GroupEffect([
      app.PlayerSound.stop(),
      new KeyframeEffect(present.el, [{opacity: 1}, {opacity: 0}], {fill: 'forwards'}),
      new KeyframeEffect(this.victoryEl, [{opacity: 0}, {opacity: 1}], {fill: 'forwards'}),
      new KeyframeEffect(this.spriteEl, [{opacity: 0}, {opacity: 1}], {fill: 'forwards'})
    ], {duration: 800, fill: 'forwards'});
  },

  walkAnimation_: function() {
    // Animates the sprite as if the elf is walking. Doesn't move the elf.
    return new KeyframeEffect(this.spriteEl, [
      {transform: 'translateZ(0) translate(0, 0em)'},
      {transform: 'translateZ(0) translate(0, -52.8em)'}
    ], {duration: app.Player.MOVE_DURATION, easing: 'steps(8, end)'});
  },

  jumpAnimation_: function() {
    // Animates the sprite as if the elf is walking. Doesn't move the elf.
    // TODO: Change the elf to look like he's jumping.
    return new KeyframeEffect(this.spriteEl, [
      {transform: 'translateZ(0) translate(0, 0em)'},
      {transform: 'translateZ(0) translate(0, -52.8em)'}
    ], {duration: app.Player.MOVE_DURATION, easing: 'steps(8, end)'});
  },

  getTranslation_: function(x, y) {
    x = x * app.Scene.TILE_OUTER_SIZE + 4;
    y = y * app.Scene.TILE_OUTER_SIZE + 4;
    return 'translateZ(0) translate(' + x + 'em, ' + y + 'em)';
  }
};
