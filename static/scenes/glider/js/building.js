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

goog.provide('app.Building');

goog.require('Constants');
goog.require('app.Chimney');
goog.require('app.Entity');
goog.require('app.shared.pools');


/**
 * Manages a building. It appears randomly across the whole screen
 * @param {Game} game The game object.
 * @constructor
 */

app.Building = function(game) {
  app.Entity.call(this);

  this.game = game;
  this.elem = $('<div class="building hidden"></div>');
  this.chimneysElem = $('<div class="chimneys">').appendTo(this.elem);

  this.type = Math.floor(Math.random() * Constants.TOTAL_BUILDINGS);
  this.info = Constants.BUILDINGS[this.type];
  this.width = this.info.width;
  this.height = this.info.height;
  this.originalwidth = this.info.originalwidth;
  this.xgap = this.info.xgap;
  this.ygap = this.info.ygap;

  this.createChimneys_();

  this.elem.addClass('building-' + (this.type + 1));
  this.game.buildingsElem.append(this.elem);
  this.setPos(this.game.sceneSize.width, this.game.sceneSize.height - this.height);
};

/**
 * Inherit from entity.
 */
app.Building.prototype = Object.create(app.Entity.prototype);

app.shared.pools.mixin(app.Building);

/**
 * Resets the building for reuse.
 */
app.Building.prototype.onInit = function() {
  this.elem.removeClass('hidden');
  this.dead = false;

  // reset chimneys
  this.children.forEach(function(chimney) { chimney.onInit(); });

  this.setPos(this.game.sceneSize.width, this.game.sceneSize.height - this.height);
};

/**
 * Updates the building
 * @param {number} delta Seconds since last frame.
 */
app.Building.prototype.onFrame = function(delta) {
  this.setPos(this.x - this.game.buildingSpeed * delta,
              this.game.sceneSize.height - this.height);

  if (this.screenX > -this.originalwidth) {
    this.elem.css('transform', 'translate3d(' + this.x + 'em, 0, 0)');
  } else {
    this.remove();
  }
};

/**
 * Registers a collision with the player.
 */
app.Building.prototype.hit = function() {
  this.game.player.hit();
  window.santaApp.fire('sound-trigger', 'glider_hit');
};

/**
 * Removes this building from the game loop.
 */
app.Building.prototype.onDispose = function() {
  this.elem.css('transform', '');
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Creates chimneys to the corresponding building.
 * @private
 */
app.Building.prototype.createChimneys_ = function() {
  var chimney;
  if (this.info.chimneys.length > 0) {
    var chimneySpecs = this.info.chimneys;
    for (var i = 0, count = chimneySpecs.length; i < count; i++) {
      chimney = new app.Chimney(this.game, this.chimneysElem, i, chimneySpecs[i].type);
      chimney.setPos(chimneySpecs[i].xpos, chimneySpecs[i].ypos);
      this.addChild(chimney);
    }
  }
};
