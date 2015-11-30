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
  this.drawerElem = drawerElem;
};

/**
 * Initialize a character with location, scale and a click event
 * @param {Array<string>} characterKeys The list of layer names in the svg.
 * @param {{height: number, width: number}} mapDimensions The map dimensions.
 */
app.Character.prototype.initialize = function(mapDimensions) {
  // Find elements
  this.elem = this.mapElem.find(`.character-collider--${this.name}`);
  this.uiElem = this.drawerElem.find(`.drawer__item--${this.name}`);
  this.svgMapElem = this.mapElem.find('.map__svg');

  // Handle found event
  this.elem.on('click touchstart', this.onFound_.bind(this));
  this.uiElem.on('click', this.onSelected_.bind(this));

  this.isFound = false;
  this.uiElem.removeClass('drawer__item--found');

  // Hide all spots
  for (var i = 1; i <= app.Constants.SPAWN_COUNT; i++) {
    this.getLayer_(i).hide();
  }

  // Show one random spot
  let randomSpot = Math.ceil(Math.random() * app.Constants.SPAWN_COUNT);
  let characterElem = this.getLayer_(randomSpot).show();

  let characterBoundaries = characterElem[0].getBoundingClientRect();

  let leftOffset = (mapDimensions.width - this.mapElem.width()) / 2;
  let topOffset = (mapDimensions.height - this.mapElem.height()) / 2;

  // Start offset
  leftOffset -= this.mapElem.offset().left;
  topOffset -= this.mapElem.offset().top;

  this.location = {
    left: (characterBoundaries.left + leftOffset) / mapDimensions.width,
    top: (characterBoundaries.top + topOffset) / mapDimensions.height,
  };

  this.scale = {
    width: characterBoundaries.width / mapDimensions.width,
    height: characterBoundaries.height / mapDimensions.height,
  };
};

/**
 * Get the layer in the SVG for the character.
 * @param {number} number The number of the layer.
 * @private
 */
app.Character.prototype.getLayer_ = function(number) {
  let name = this.name.replace('-', '').toUpperCase();
  return this.svgMapElem.find(`#${name}-${number}`);
};

/**
 * Positions a character based on map dimensions.
 * @param {{height: number, width: number}} mapDimensions The map dimensions.
 */
app.Character.prototype.updatePosition = function(mapDimensions) {
  if (!this.elem) {
    return;
  }

  let left = mapDimensions.width * this.location.left;
  let top = mapDimensions.height * this.location.top;

  this.elem.css('transform', `translate3d(${left}px, ${top}px, 0)`);
};

/**
 * Change the scale of the character.
 * @param {{height: number, width: number}} mapDimensions The map dimensions.
 */
app.Character.prototype.updateScale = function(mapDimensions) {
  if (!this.elem) {
    return;
  }

  let characterWidth = mapDimensions.width * this.scale.width;
  let characterHeight = mapDimensions.height * this.scale.height;

  this.elem.css('width', characterWidth);
  this.elem.css('height', characterHeight);
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

  let wasFocused = this.uiElem.hasClass('drawer__item--focused');
  this.isFound = true;
  this.uiElem.removeClass('drawer__item--focused');
  this.uiElem.addClass('drawer__item--found');

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
  this.uiElem.addClass('drawer__item--focused');
};

/**
 * Removes focus from the character.
 */
app.Character.prototype.blur = function() {
  this.uiElem.removeClass('drawer__item--focused');
};
