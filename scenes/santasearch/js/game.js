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

goog.provide('app.Game');

goog.require('app.Controls');
goog.require('app.Constants');
goog.require('app.shared.utils');



/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);

  this.characters = {
    'santa': {
      elem: this.elem.find('.santa'),
      location: {},
      scale: {}
    },
    'mrs-claus': {
      elem: this.elem.find('.mrs-claus'),
      location: {},
      scale: {}
    },
    'rudolph': {
      elem: this.elem.find('.rudolph'),
      location: {},
      scale: {}
    }
  }

  this.gameStartTime = null;
  this.sceneElem = this.elem.find('.scene');
  this.controls = new app.Controls(elem);

  this.mapElem = this.elem.find('.map');
  this.mapElementDimensions = {};

  this.onFrame_ = this.onFrame_.bind(this);

  this.gameAspectRatio = 1600 / 900;
};


/**
 * Start the game
 * @export
 */
app.Game.prototype.start = function() {
  this.restart();

  this._initializeCharacter('santa');
  this._initializeCharacter('mrs-claus');
  this._initializeCharacter('rudolph');
  this._scale(1);

  this._setupEventHandlers();

  this.controls.start();
};

/**
 * Sets up event handlers for the game
 * @private
 */
app.Game.prototype._setupEventHandlers = function() {
  $(window).on('resize.santasearch', this._onResize.bind(this));
};

/**
 * Handles the event when a character is selected
 * @param {string} character Name of selected character.
 * @private
 */
app.Game.prototype._onCharacterSelected = function(characterName) {
  console.log(`${characterName} was selected!`);
};

/**
 * Initialize a character with location, scale and a click event
 * @param {string} character Name of the character.
 * @private
 */
app.Game.prototype._initializeCharacter = function(characterName) {
  let spawns = app.Constants.SPAWNS[characterName];
  let randomSpawn = Math.floor(Math.random() * spawns.length);
  let characterSpawnPoint = spawns[randomSpawn];

  let character = this.characters[characterName];

  character.location = characterSpawnPoint.locationScale;
  character.scale = characterSpawnPoint.sizeScale;

  character.elem.on('click.santasearch', this._onCharacterSelected.bind(this, characterName));
};

/**
 * Positions a character based on mapElementDimensions
 * @param {Element} elem The element of the character to position.
 * @param {Object} location Width/Height scale attributes.
 * @private
 */
app.Game.prototype._positionCharacter = function(elem, locationScale) {
  let left = this.mapElementDimensions.width * locationScale.left;
  let top = this.mapElementDimensions.height * locationScale.top;

  elem.css('transform', `translate(${left}px, ${top}px)`);
}

app.Game.prototype._scaleCharacter = function(elem, scale) {
  let characterWidth = this.mapElementDimensions.width * scale.width;
  let characterHeight = this.mapElementDimensions.height * scale.height;

  elem.css('width', characterWidth);
  elem.css('height', characterHeight);
  elem.css('margin-left', `-${characterWidth/2}px`);
  elem.css('margin-top', `-${characterHeight/2}px`);
};

/**
 * Scales the map when the user wants to zoom in our out
 * @param {number} value Scale factor.
 * @private
 */
app.Game.prototype._scale = function(value) {
  let windowAspectRatio = window.innerWidth / window.innerHeight;

  if (windowAspectRatio < this.gameAspectRatio) {
    this.mapElementDimensions.width = window.innerHeight * this.gameAspectRatio;
    this.mapElementDimensions.height = window.innerHeight;
  } else {
    this.mapElementDimensions.width = window.innerWidth;
    this.mapElementDimensions.height = window.innerWidth / this.gameAspectRatio;
  }

  this.mapElementDimensions.width *= value;
  this.mapElementDimensions.height *= value;

  this.mapElem.css('width', this.mapElementDimensions.width);
  this.mapElem.css('height', this.mapElementDimensions.height);

  this.mapElem.css('margin-left', -(this.mapElementDimensions.width / 2));
  this.mapElem.css('margin-top', -(this.mapElementDimensions.height / 2));

  this._updateCharacters();
}

/**
 * Updates scale and location of characters, called after map is scaled
 * @private
 */
app.Game.prototype._updateCharacters = function() {
  let characterNames = Object.keys(this.characters);

  characterNames.forEach((characterName) => {
    let character = this.characters[characterName];

    this._scaleCharacter(character.elem, character.scale);
    this._positionCharacter(character.elem, character.location);
  });
};

/**
 * Makes sure that the player can not pan out of the map
 * @private
 */
app.Game.prototype._updatePan = function() {
  let panX = this.controls.pan.x;
  let panY = this.controls.pan.y;

  let panXMax = (this.mapElementDimensions.width - window.innerWidth) / 2;
  let panYMax = (this.mapElementDimensions.height - window.innerHeight) / 2;

  let panXDiff = panXMax - Math.abs(panX);
  let panYDiff = panYMax - Math.abs(panY);

  if (panXDiff < 0) {
    this.controls.pan.x = (panX < 0) ? -panXMax : panXMax;
  }

  if (panYDiff < 0) {
    this.controls.pan.y = (panY < 0) ? -panYMax : panYMax;
  }
}

/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  this.paused = false;
  this.unfreezeGame();

  window.santaApp.fire('analytics-track-game-start', {gameid: 'santasearch'});
  this.gameStartTime = +new Date;
};


/**
 * Updates game state since last frame.
 * @param {number} delta Time elapsed since last update in milliseconds
 */
app.Game.prototype.update = function(delta) {
  if (!this.isPlaying) {
    return;
  }

  if (this.controls.needsScaleUpdate) {
    this._scale(this.controls.scale);
    this.controls.needsScaleUpdate = false;
  }

  this._updatePan();

  let panX = this.controls.pan.x;
  let panY = this.controls.pan.y;

  this.mapElem.css('transform', `translate3d(${panX}px, ${panY}px, 0)`);

  this.accumulator += delta;
};


/**
 * Freezes the game. Stops the onFrame loop and stops any CSS3 animations.
 * Used both for game over and pausing.
 */
app.Game.prototype.freezeGame = function() {
  this.isPlaying = false;
  this.elem.addClass('frozen');
};


/**
 * Unfreezes the game, starting the game loop as well.
 */
app.Game.prototype.unfreezeGame = function() {
  if (!this.isPlaying) {
    this.elem.removeClass('frozen');

    this.isPlaying = true;
    this.lastFrame = +new Date();
    this.requestId = app.shared.utils.requestAnimFrame(this.onFrame_);
  }
};


/**
 * Game loop. Runs every frame using requestAnimationFrame.
 * @private
 */
app.Game.prototype.onFrame_ = function() {
  if (!this.isPlaying) {
    return;
  }

  // Calculate delta since last frame.
  var now = +new Date();
  var delta = Math.min(1000, now - this.lastFrame);
  this.lastFrame = now;

  // Update game state
  this.update(delta);

  // Request next frame
  this.requestId = app.shared.utils.requestAnimFrame(this.onFrame_);
};


/**
 * Pause the game.
 */
app.Game.prototype.pause = function() {
  this.paused = true;
  this.freezeGame();
};


/**
 * Resume the game.
 */
app.Game.prototype.resume = function() {
  this.paused = false;
  this.unfreezeGame();
};


/**
 * Makes sure the map will never be smaller than the window.
 * @private
 */
app.Game.prototype._onResize = function() {
  let windowWidthLargerThanMap = window.innerWidth > this.mapElementDimensions.width;
  let windowHeightLargerThanMap = window.innerHeight > this.mapElementDimensions.height;

  let mapNeedsResizing = windowWidthLargerThanMap || windowHeightLargerThanMap;

  if (mapNeedsResizing) {
    this._scale(this.controls.scale);
  }
};


/**
 * Dispose the game.
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    var opts = {
      gameid: 'santasearch',
      timePlayed: new Date - this.gameStartTime,
      level: 1
    };
    window.santaApp.fire('analytics-track-game-quit', opts);
  }
  this.freezeGame();

  app.shared.utils.cancelAnimFrame(this.requestId);
  $(window).off('.santasearch');
  $(document).off('.santasearch');
  this.elem.off('.santasearch');
};
