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
'use strict';

goog.provide('app.Character');

goog.require('app.Constants');

/**
 * @param {String} name The name of the character.
 * @param {!jQuery} mapElem The element for the map.
 * @param {!jQuery} drawerElem The element for the drawer.
 * @constructor
 */
app.Character = function(name, mapElem, drawerElem) {
  this.name = name;
  this.location = {};
  this.scale = {};
  this.isFound = false;

  this.mapElem = mapElem;

  // Find elements
  this.colliderElem = this.mapElem.find(`.character-collider--${this.name}`);
  this.drawerItemElem = drawerElem.find(`.drawer__item--${this.name}`);
  this.layerElem = null;

  // Handle found event
  this.colliderElem.on('click touchstart', this.onFound_.bind(this));
  this.drawerItemElem.on('click', this.onSelected_.bind(this));
};

/**
 * Initialize a character with location, scale and a click event
 * @param {{height: number, width: number}} mapDimensions The map dimensions.
 */
app.Character.prototype.reset = function(mapDimensions) {
  let svgMapElem = this.mapElem.find('.map__svg');

  this.isFound = false;
  this.drawerItemElem.removeClass('drawer__item--found')
      .removeClass('drawer__item--focused');
  this.colliderElem.removeClass('character-collider--found');

  // Hide all spots
  for (let i = 1; i <= app.Constants.SPAWN_COUNT; i++) {
    this.getLayer_(svgMapElem, i).hide();
  }

  // Show one random spot
  let randomSpot = Math.ceil(Math.random() * app.Constants.SPAWN_COUNT);
  this.layerElem = this.getLayer_(svgMapElem, randomSpot).show();

  // In case character layers are missing from the SVG
  if (this.layerElem.length === 0) {
    console.error(`Layer ${randomSpot} for ${this.name} not found.`);
    return;
  }

  this.layerElem[0].classList.add('map__character');
  this.layerElem[0].classList.remove('map__character--found');
  
  let characterBoundaries = this.layerElem[0].getBoundingClientRect();
  let characterOffset = this.layerElem.offset();

  let leftOffset = (mapDimensions.width - this.mapElem.width()) / 2;
  let topOffset = (mapDimensions.height - this.mapElem.height()) / 2;

  // Start offset
  leftOffset -= this.mapElem.offset().left;
  topOffset -= this.mapElem.offset().top;

  this.location = {
    left: (characterOffset.left + leftOffset) / mapDimensions.width,
    top: (characterOffset.top + topOffset) / mapDimensions.height,
  };

  this.scale = {
    width: characterBoundaries.width / mapDimensions.width,
    height: characterBoundaries.height / mapDimensions.height,
  };
};

/**
 * Get the layer in the SVG for the character.
 * @param {!jQuery} svgMapElem The SVG map element.
 * @param {number} number The number of the layer.
 * @private
 */
app.Character.prototype.getLayer_ = function(svgMapElem, number) {
  let name = this.name.replace('-', '').toUpperCase();
  return svgMapElem.find(`#${name}-${number}`);
};

/**
 * Positions a character based on map dimensions.
 * @param {{height: number, width: number}} mapDimensions The map dimensions.
 */
app.Character.prototype.updatePosition = function(mapDimensions) {
  if (!this.colliderElem) {
    return;
  }

  let left = mapDimensions.width * this.location.left;
  let top = mapDimensions.height * this.location.top;

  this.colliderElem.css('transform', `translate3d(${left}px, ${top}px, 0)`);
};

/**
 * Change the scale of the character.
 * @param {{height: number, width: number}} mapDimensions The map dimensions.
 */
app.Character.prototype.updateScale = function(mapDimensions) {
  if (!this.colliderElem) {
    return;
  }

  let characterWidth = mapDimensions.width * this.scale.width;
  let characterHeight = mapDimensions.height * this.scale.height;

  this.colliderElem.css('width', characterWidth);
  this.colliderElem.css('height', characterHeight);
};

/**
 * Called when the character has lost focus.
 */
app.Character.prototype.onLostFocus = null;

/**
 * Handles the event when a character is found
 * @private
 */
app.Character.prototype.onFound_ = function() {
  if (this.isFound) {
    return;
  }
  window.ga('send', 'event', 'game', 'found', 'santasearch')

  window.santaApp.fire('sound-trigger', `ss_character_${this.name}`);
  let wasFocused = this.drawerItemElem.hasClass('drawer__item--focused');
  this.isFound = true;
  this.drawerItemElem.removeClass('drawer__item--focused');
  this.drawerItemElem.addClass('drawer__item--found');
  this.colliderElem.addClass('character-collider--found');

  this.layerElem[0].classList.add('map__character--found');

  if (wasFocused && this.onLostFocus) {
    this.onLostFocus();
  }
};

/**
 * Called when the character is selected.
 */
app.Character.prototype.onSelected = null;

/**
 * Handles the event when a character is selected.
 * @private
 */
app.Character.prototype.onSelected_ = function() {
  if (!this.isFound && this.onSelected) {
    this.onSelected();
  }
};

/**
 * Focuses a character in the UI that the user should try to find.
 */
app.Character.prototype.focus = function() {
  this.drawerItemElem.addClass('drawer__item--focused');
};

/**
 * Removes focus from the character.
 */
app.Character.prototype.blur = function() {
  this.drawerItemElem.removeClass('drawer__item--focused');
};
