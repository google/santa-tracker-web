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

goog.provide('app.Scoreboard');

/**
 * Manages the scoreboard and game countdown.
 * A minimalistic fork of the shared class. Don't need buttons, countdown
 * or points.
 * @constructor
 * @param {*} elem Ignored.
 * @param {number} levels The total number of levels.
 */
app.Scoreboard = function(elem, levels) {
  this.levels = levels;
};

/**
 * Sets the current level on the scoreboard.
 * @param {number} level The current level, 0-based.
 */
app.Scoreboard.prototype.setLevel = function(level) {
  const detail = {
    level: level + 1,  // games are zero-indexed
    levels: this.levels,
  };
  window.santaApp.fire('game-score', detail);
};
