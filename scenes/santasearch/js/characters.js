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

app.Characters = function(mapElem, drawerElem, mapDimensions) {
  this.mapElem = mapElem;
  this.drawerElem = drawerElem;
  this.mapDimensions = mapDimensions;

  this.characters = {
    'santa': {
      elem: this.mapElem.find('.character--santa'),
      uiElem: this.drawerElem.find('.character--santa').parent(),
      location: {},
      scale: {},
      isFound: false
    },
    'mrs-claus': {
      elem: this.mapElem.find('.character--mrs-claus'),
      uiElem: this.drawerElem.find('.character--mrs-claus').parent(),
      location: {},
      scale: {}
    },
    'rudolph': {
      elem: this.mapElem.find('.character--rudolph'),
      uiElem: this.drawerElem.find('.character--rudolph').parent(),
      location: {},
      scale: {},
      isFound: false
    },
    'gingerbread-man': {
      elem: this.mapElem.find('.character--gingerbread-man'),
      uiElem: this.drawerElem.find('.character--gingerbread-man').parent(),
      location: {},
      scale: {},
      isFound: false
    },
    'pegman': {
      elem: this.mapElem.find('.character--pegman'),
      uiElem: this.drawerElem.find('.character--pegman').parent(),
      location: {},
      scale: {},
      isFound: false
    },
    'penguin': {
      elem: this.mapElem.find('.character--penguin'),
      uiElem: this.drawerElem.find('.character--penguin').parent(),
      location: {},
      scale: {},
      isFound: false
    }
  };

  this.allFound = false;
  this.hintTarget = undefined;
}

app.Characters.prototype.initialize = function() {
  this.allFound = false;
  this.hintTarget = undefined;

  this._initializeCharacter('santa');
  this._initializeCharacter('mrs-claus');
  this._initializeCharacter('rudolph');
  this._initializeCharacter('gingerbread-man');
  this._initializeCharacter('pegman');
  this._initializeCharacter('penguin');
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
  let characterNames = Object.keys(this.characters);

  characterNames.forEach((characterName) => {
    let character = this.characters[characterName];

    this._scaleCharacter(character.elem, character.scale);
    this._positionCharacter(character.elem, character.location);
  });
};

/**
 * Finds the next character in the UI that has not already been found
 * @private
 */
app.Characters.prototype.focusNextUnfoundCharacter = function() {
  console.log(`Focusing next unfound character`);

  let nextToFind = '';

  if (!this.characters['santa'].isFound) {
    nextToFind = 'santa';
  } else if (!this.characters['penguin'].isFound) {
    nextToFind = 'penguin';
  } else if (!this.characters['gingerbread-man'].isFound) {
    nextToFind = 'gingerbread-man';
  } else if (!this.characters['rudolph'].isFound) {
    nextToFind = 'rudolph';
  } else if (!this.characters['pegman'].isFound) {
    nextToFind = 'pegman';
  } else if (!this.characters['mrs-claus'].isFound) {
    nextToFind = 'mrs-claus';
  }

  if (nextToFind !== '') {
    this._focusUICharacter(nextToFind);
  } else {
    this.allFound = true;
  }
};

/**
 * Initialize a character with location, scale and a click event
 * @param {string} characterName Name of the character.
 * @private
 */
app.Characters.prototype._initializeCharacter = function(characterName) {
  let spawns = app.Constants.SPAWNS[characterName];
  let randomSpawn = Math.floor(Math.random() * spawns.length);
  let characterSpawnPoint = spawns[randomSpawn];

  let character = this.characters[characterName];

  character.isFound = false;
  character.uiElem.removeClass('drawer__character-wrapper--found');

  character.location = characterSpawnPoint.locationScale;
  character.scale = characterSpawnPoint.sizeScale;

  character.elem.on('click.santasearch', this._onCharacterSelected.bind(this, characterName));

  let hintElem = character.uiElem.find('.hint');
  hintElem.on('click.santasearch', this._setHintTarget.bind(this, characterName));
};

app.Characters.prototype._setHintTarget = function(characterName) {
  this.hintTarget = characterName;
};

/**
 * Positions a character based on mapElementDimensions
 * @param {Element} elem The element of the character to position.
 * @param {Object} location Width/Height scale attributes.
 * @private
 */
app.Characters.prototype._positionCharacter = function(elem, locationScale) {
  let left = this.mapDimensions.width * locationScale.left;
  let top = this.mapDimensions.height * locationScale.top;

  elem.css('transform', `translate3d(${left}px, ${top}px, 0)`);
}

app.Characters.prototype._scaleCharacter = function(elem, scale) {
  let characterWidth = this.mapDimensions.width * scale.width;
  let characterHeight = this.mapDimensions.height * scale.height;

  elem.css('width', characterWidth);
  elem.css('height', characterHeight);
  elem.css('margin-left', `-${characterWidth/2}px`);
  elem.css('margin-top', `-${characterHeight/2}px`);
};

/**
 * Handles the event when a character is selected
 * @param {string} character Name of selected character.
 * @private
 */
app.Characters.prototype._onCharacterSelected = function(characterName) {
  console.log(`${characterName} was selected!`);

  let character = this.characters[characterName];

  if (!character.isFound) {
    character.uiElem.removeClass('drawer__character-wrapper--focused');
    character.uiElem.addClass('drawer__character-wrapper--found');
    character.isFound = true;

    this.focusNextUnfoundCharacter();
  }
};

/**
 * Focuses a character in the UI that the user should try to find
 * @param {string} characterName Name of selected character.
 * @private
 */
app.Characters.prototype._focusUICharacter = function(characterName) {
  console.log(`Focusing ${characterName}`);

  this.characters[characterName].uiElem.addClass('drawer__character-wrapper--focused');
};
