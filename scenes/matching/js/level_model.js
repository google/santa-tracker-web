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

goog.provide('LevelModel');

/**
 * @constructor
 * @param {!jQuery} elem
 */
var LevelModel = function(elem) {
  this.level = null;
  this.elem = elem;
  this.lastPattern = null;

  // These are the doors indexes
  // according to our grid layout:
  // 0 1 2 3 4 5
  // 6 7 8 9 10 11

  // Set the active doors indexes
  // per level
  this.DOORS_LEVEL_MAP = [
    [2, 3, 8, 9],
    [0, 1, 2, 3, 4, 5],
    [1, 2, 3, 4, 7, 8, 9, 10],
    [0, 1, 2, 3, 4, 5, 7, 8, 9, 10],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  ];

  // These are allowed patterns for each level. One will be picked at random.
  this.PATTERNS_LEVEL_MAP = [
    ['horMirror', 'offset01', 'checkerboard'],
    ['offset10', 'offset30', 'random'],
    ['horMirror', 'offset01', 'random'],
    ['horMirror', 'offset10Alt', 'random'],
    ['horMirror', 'offset01', 'checkerboard', 'offset11', 'offset10', 'offset10Alt'],
    ['horMirror', 'offset01', 'checkerboard', 'offset11', 'offset10', 'offset10Alt'],
    ['horMirror', 'offset11', 'offset30', 'horVerMirror'],
    ['horMirror', 'offset11', 'offset30', 'horVerMirror', 'random'],
    ['offset30', 'horVerMirror', 'random'],
    ['random']
  ];

  // These are the different card patterns.
  this.DOORS_PATTERNS = {
    // Horizontal Mirror
    horMirror: [4, 2, 0, 0, 2, 4,
                5, 3, 1, 1, 3, 5],

    // Checkerboard
    checkerboard: [3, 2, 1, 0, 4, 5,
                   2, 3, 0, 1, 5, 4],

    // Offset 1,1
    offset11: [0, 1, 2, 3, 4, 5,
               5, 0, 1, 2, 3, 4],

    // Vertical Mirror
    offset01: [4, 2, 0, 1, 3, 5,
                4, 2, 0, 1, 3, 5],

    // Offset 1,0
    offset10: [0, 0, 1, 1, 2, 2,
               3, 3, 4, 4, 5, 5],

    // Offset 1,0 but alternate rows.
    offset10Alt: [0, 0, 1, 1, 2, 2,
                  5, 3, 3, 4, 4, 5],

    // Offset 3,0
    offset30: [0, 1, 2, 0, 1, 2,
               3, 4, 5, 3, 4, 5],

    // Horizontal+Vertical Mirror
    horVerMirror: [0, 1, 2, 3, 4, 5,
                   5, 4, 3, 2, 1, 0]
  };

  this.compilePatterns_();
};

/**
 * Compiles the door patterns into card indexes.
 * @private
 */
LevelModel.prototype.compilePatterns_ = function() {
  for (var k in this.DOORS_PATTERNS) {
    if (!this.DOORS_PATTERNS.hasOwnProperty(k)) {
      return;
    }
    var pattern = this.DOORS_PATTERNS[k];
    var found = new Array(6);
    for (var i = 0, card; i < 12; i++) {
      card = pattern[i];
      if (found[card]) {
        pattern[i] = card * 2 + 1;
      } else {
        pattern[i] = card * 2;
        found[card] = true;
      }
    }
  }

  // Validate all level options.
  for (var level = 0, patterns; patterns = this.PATTERNS_LEVEL_MAP[level]; level++) {
    var cards = new Array(this.DOORS_LEVEL_MAP[level].length);
    for (var j = 0, pattern; pattern = patterns[j]; j++) {
      this.shuffle_(cards, pattern, level);
    }
  }
};

/**
 * Sets up the level model.
 */
LevelModel.prototype.start = function() {
};

/**
 * Gets the number of doors for a specific level.
 * @return {number}
 */
LevelModel.prototype.getNumberOfDoors = function() {
  return this.DOORS_LEVEL_MAP[this.level].length;
};

/**
 * Maps a level door index to world door index.
 * @param {number} i level index
 * @return {number}
 */
LevelModel.prototype.getDoorIndex = function(i) {
  return this.DOORS_LEVEL_MAP[this.level][i];
};

/**
 * Shuffles cards of a level according to different level-appropriate rules
 * @param {!Array.<string>} cards
 * @return {!Array.<string>}
 */
LevelModel.prototype.shuffleCards = function(cards) {
  var levelPatterns = this.PATTERNS_LEVEL_MAP[this.level];
  var randomIndex, pattern;

  do {
    randomIndex = Math.floor(Math.random() * levelPatterns.length);
    pattern = levelPatterns[randomIndex];
  } while (pattern !== 'random' && pattern === this.lastPattern);

  // Avoid doing the same pattern twice.
  this.lastPattern = pattern;
  return this.shuffle_(cards, pattern, this.level);
};

/**
 * Shuffles cards either randomly or with a pattern.
 * @param {!Array.<string>} cards to shuffle.
 * @param {string} pattern to use.
 * @param {number} level to shuffle for.
 * @return {!Array.<string>} shuffled cards.
 * @private
 */
LevelModel.prototype.shuffle_ = function(cards, pattern, level) {
  if (pattern === 'random') {
    return app.utils.shuffleArray(cards);
  } else {
    return this.patternShuffle_(cards, pattern, level);
  }
};

/**
 * Shuffles cards based on a predefined pattern.
 * @param {!Array.<string>} cards to shuffle.
 * @param {string} pattern to use.
 * @param {number} level to shuffle for.
 * @return {!Array.<string>} shuffled cards.
 * @private
 */
LevelModel.prototype.patternShuffle_ = function(cards, pattern, level) {
  var shuffled = new Array(cards.length);
  var map = this.DOORS_LEVEL_MAP[level];
  pattern = this.DOORS_PATTERNS[pattern];

  for (var i = 0; i < cards.length; i++) {
    var index = pattern[map[i]];
    if (index >= cards.length) {
      throw new Error('Pattern was out of level bounds');
    }
    shuffled[i] = cards[index];
  }
  return shuffled;
};

/**
 * Sets the current level.
 * @param {number} level
 */
LevelModel.prototype.set = function(level) {
  this.level = level - 1;
};

/**
 * Gets the current level.
 * @return {number}
 */
LevelModel.prototype.get = function() {
  return this.level + 1;
};

/**
 * Restarts the game to first level.
 */
LevelModel.prototype.reset = function() {
  this.level = 0;
};

/**
 * Starts next level.
 */
LevelModel.prototype.next = function() {
  this.set(this.level + 2);
};
