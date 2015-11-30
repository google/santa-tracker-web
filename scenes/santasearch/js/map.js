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

goog.provide('app.Map');

goog.require('app.Character');
goog.require('app.Constants');

/**
 * The map where characters are hidden.
 * @param {!jQuery} mapElem The element for the map.
 * @param {!jQuery} drawerElem The element for the drawer.
 * @param {{height: number, width: number}} mapDimensions The map dimensions.
 * @constructor
 */
app.Map = function(mapElem, drawerElem, mapDimensions) {
  this.mapElem = mapElem;
  this.drawerElem = drawerElem;
  this.mapDimensions = mapDimensions;

  /** @type {!Object<app.Character>} */
  this.characters = {
    santa: null,
    penguin: null,
    'gingerbread-man': null,
    rudolph: null,
    pegman: null,
    'mrs-claus': null,
  };

  app.Constants.CHARACTERS.forEach((name) => {
    this.characters[name] = new app.Character(name, this.mapElem,
        this.drawerElem);
  });

  this.allFound = false;
  this.hintTarget = undefined;

  // Bind context
  this.focusNextUnfoundCharacter_ = this.focusNextUnfoundCharacter_.bind(this);
  this.changeFocus_ = this.changeFocus_.bind(this);
  this.setHintTarget_ = this.setHintTarget_.bind(this);
  this.initializeCharacters_ = this.initializeCharacters_.bind(this);
};

/**
 * Initialize the map.
 */
app.Map.prototype.setMap = function(mapName) {
  this.mapName = mapName;
  this.allFound = false;
  this.hintTarget = undefined;

  this.loadMap_().then(this.initializeCharacters_);

  this.drawerElem.on('click.santasearch', '.hint', this.setHintTarget_);
};

/**
 * Initialize characters.
 */
app.Map.prototype.initializeCharacters_ = function() {
  let characterKeys = app.Constants.SPAWNS[this.mapName];

  app.Constants.CHARACTERS.forEach((name) => {
    let character = this.characters[name];
    character.initialize(characterKeys[name], this.mapDimensions);
    character.onLostFocus = this.focusNextUnfoundCharacter_;
    character.onSelected = this.changeFocus_.bind(this, character);
  });

  this.updateCharacters();
  this.focusedCharacter = this.characters.santa;
  this.focusedCharacter.focus();
};

/**
 * Load the map and add it to the dom.
 * @returns {jQuery.jqXHR}
 */
app.Map.prototype.loadMap_ = function() {
  return $.ajax('img/maps/museum.svg').then((svgMap) => {
    // Remove existing maps
    this.mapElem.find('.map__svg').remove();

    // Add the new map into the dom
    this.mapElem.prepend(svgMap.children[0]);
  });
};

/**
 * Show hint for focused character.
 * @private
 */
app.Map.prototype.setHintTarget_ = function() {
  this.hintTarget = this.focusedCharacter;
};

/**
 * Updates scale and location of characters, called after map is scaled.
 */
app.Map.prototype.updateCharacters = function() {
  app.Constants.CHARACTERS.forEach((name) => {
    let character = this.characters[name];
    character.updateScale(this.mapDimensions);
    character.updatePosition(this.mapDimensions);
  });
};

/**
 * Finds the next character in the UI that has not already been found.
 * @private
 */
app.Map.prototype.focusNextUnfoundCharacter_ = function() {
  let nextToFind;
  for (let i = 0; i < app.Constants.CHARACTERS.length; i++) {
    let name = app.Constants.CHARACTERS[i];
    let character = this.characters[name];
    if (!character.isFound) {
      nextToFind = character;
      break;
    }
  }

  if (nextToFind) {
    this.focusedCharacter.blur();
    nextToFind.focus();
    this.focusedCharacter = nextToFind;
  } else {
    this.allFound = true;
  }
};

/**
 * Change focus to another character.
 * @param {!app.Character} character The character that gets focused.
 * @private
 */
app.Map.prototype.changeFocus_ = function(character) {
  this.focusedCharacter.blur();
  character.focus();
  this.focusedCharacter = character;
};
