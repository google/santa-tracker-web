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
 * @param {!jQuery} elem The scene element.
 * @param {!jQuery} mapElem The map element.
 * @param {string} componentDir The path to the scene.
 * @param {app.Controls} controls The controls object.
 * @constructor
 */
app.Map = function(elem, mapElem, componentDir, controls) {
  this.mapElem = mapElem;
  this.drawerElem = elem.find('.drawer');
  this.sizeElem = elem.find('.viewport__size');
  this.componentDir = componentDir;
  this.controls = controls;

  /** @type {!Object<app.Character>} */
  this.characters = {
    santa: null,
    penguin: null,
    'gingerbread-man': null,
    rudolph: null,
    pegman: null,
    'mrs-claus': null,
  };

  this.allFound = false;
  this.hintTarget = undefined;

  // Bind context
  this.focusNextUnfoundCharacter_ = this.focusNextUnfoundCharacter_.bind(this);
  this.changeFocus_ = this.changeFocus_.bind(this);
  this.setHintTarget_ = this.setHintTarget_.bind(this);

  // Initialize characters
  app.Constants.CHARACTERS.forEach((name) => {
    let character = new app.Character(name, mapElem, this.drawerElem);
    character.onLostFocus = this.focusNextUnfoundCharacter_;
    character.onSelected = this.changeFocus_.bind(this, character);
    this.characters[name] = character;
  });
};

/**
 * Initialize the map.
 * @param {string} mapName The name of the map.
 * @param {{width: number, height: number}} mapDimensions The map dimensions.
 */
app.Map.prototype.setMap = function(mapName, mapDimensions) {
  this.allFound = false;
  this.hintTarget = undefined;

  this.loadMap_(mapName, mapDimensions);

  this.drawerElem.on('click.santasearch', '.hint', this.setHintTarget_).show();
  this.mapName = mapName;
};

/**
 * Reset characters.
 * @param {{width: number, height: number}} mapDimensions The map dimensions.
 */
app.Map.prototype.resetCharacters_ = function(mapDimensions) {
  app.Constants.CHARACTERS.forEach((name) => {
    let character = this.characters[name];
    character.reset(mapDimensions);
  });

  this.updateCharacters_(mapDimensions);

  // Focus on Santa
  this.focusedCharacter = this.characters.santa;
  this.focusedCharacter.focus();
};

/**
 * Load the map and add it to the dom.
 * @param {string} mapName The name of the map to load.
 * @param {{width: number, height: number}} mapDimensions The map dimensions.
 * @private
 */
app.Map.prototype.loadMap_ = function(mapName, mapDimensions) {
  if (this.mapName === mapName) {
    this.resetCharacters_(mapDimensions);
    return;
  }

  let mapPath = `${this.componentDir}img/maps/${mapName}.svg`;
  return $.ajax(mapPath).then((svgMap) => {
    // Remove existing maps
    this.mapElem.find('.map__svg').remove();

    // Work around base href, which causes all inline IDs to refer to the base
    // href in production (which is served from maps.gstatic.com...). Refer
    // to the local pageUrl instead, since the clippath elements are inlined.
    var pageUrl = location.href.substr(0, location.href.length - location.hash.length);
    var all = this.mapElem[0].querySelectorAll('[style]');
    for (var i = 0, el; el = all[i]; ++i) {
      var s = el.style;
      if (s.clipPath) {
        // nb. assumes `url("#` or `url(#` ...
        s.clipPath = s.clipPath.replace('#', `${pageUrl}#`);
      }
    }

    // Add the new map into the dom
    this.mapElem.prepend(svgMap.children[0]);
    this.mapName = mapName;

    this.resetCharacters_(mapDimensions);
  });
};

/**
 * Show hint for focused character.
 * @private
 */
app.Map.prototype.setHintTarget_ = function() {
  if (this.controls.enabled) {
    this.hintTarget = this.focusedCharacter;
  }
};

/**
 * Updates scale and location of characters, called after map is scaled.
 * @param {{width: number, height: number}} mapDimensions The map dimensions.
 * @private
 */
app.Map.prototype.updateCharacters_ = function(mapDimensions) {
  app.Constants.CHARACTERS.forEach((name) => {
    let character = this.characters[name];
    character.updateScale(mapDimensions);
    character.updatePosition(mapDimensions);
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

/**
 * Change the size of the map.
 * @param {{width: number, height: number}} mapDimensions The map dimensions.
 */
app.Map.prototype.changeSize = function(mapDimensions) {
  this.mapElem.css('width', mapDimensions.width);
  this.mapElem.css('height', mapDimensions.height);

  this.sizeElem.css('width', mapDimensions.width);
  this.sizeElem.css('height', mapDimensions.height);

  this.mapElem.css('margin-left', -(mapDimensions.width / 2));
  this.mapElem.css('margin-top', -(mapDimensions.height / 2));

  this.updateCharacters_(mapDimensions);
};
