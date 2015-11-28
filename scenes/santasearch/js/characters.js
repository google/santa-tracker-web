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

goog.provide('app.Characters');

goog.require('app.Constants');
goog.require('app.Character');

const characterNames = ['santa', 'penguin', 'gingerbread-man', 'rudolph', 'pegman', 'mrs-claus'];

app.Characters = function(mapElem, drawerElem, mapDimensions) {
  this.mapElem = mapElem;
  this.drawerElem = drawerElem;
  this.mapDimensions = mapDimensions;
  this.mapName = 'museum';
  this.characters = {};

  characterNames.forEach((name) => {
    this.characters[name] = new app.Character(name, this.mapElem, this.drawerElem, mapDimensions);
  });

  this.allFound = false;
  this.hintTarget = undefined;

  this.focusNextUnfoundCharacter = this.focusNextUnfoundCharacter.bind(this);
  this.clearFocus = this.clearFocus.bind(this);
}

app.Characters.prototype.initialize = function() {
  this.allFound = false;
  this.hintTarget = undefined;

  let characterKeys = app.Constants.SPAWNS[this.mapName];

  characterNames.forEach((name) => {
    let character = this.characters[name];
    character.initialize(characterKeys[name], this.mapDimensions);
    character.onLostFocus = this.focusNextUnfoundCharacter;
    character.onSelected = this.clearFocus;
  });

  this.updateCharacters();
  this.focusedCharacter = this.characters['santa'];
  this.focusedCharacter.focus();

  this.drawerElem.on('click.santasearch', '.hint', this._setHintTarget.bind(this));
};

app.Characters.prototype._setHintTarget = function() {
  this.hintTarget = this.focusedCharacter;
};

app.Characters.prototype.getCharacterLocation = function(name) {
  if (this.characters[name]) {
    return this.characters[name].location;
  } else {
    return undefined;
  }
};

/**
 * Updates scale and location of characters, called after map is scaled
 * @private
 */
app.Characters.prototype.updateCharacters = function() {
  characterNames.forEach((name) => {
    let character = this.characters[name];
    character.updateScale(this.mapDimensions);
    character.updatePosition(this.mapDimensions);
  });
};

/**
 * Finds the next character in the UI that has not already been found
 * @private
 */
app.Characters.prototype.focusNextUnfoundCharacter = function() {
  let nextToFind;
  for (let i = 0; i < characterNames.length; i++) {
    let character = this.characters[characterNames[i]];
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

app.Characters.prototype.clearFocus = function(character) {
  this.focusedCharacter.blur();
  character.focus();
  this.focusedCharacter = character;
};
