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

goog.provide('app.encoding');


/**
 * Run length encoding of beard point states, using only letters and digits so the result stays
 * short in a URL. Each run is written as its length followed by the state: one uppercase letter
 * for a state below 26, otherwise a lowercase letter followed by a second letter.
 */
app.encoding = {

  /** @const {string} */
  LETTERS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',

  /** @const {number} Number of states that can be written. */
  MAX_STATES: 26 + 26 * 52,

  /**
   * @param {!Array<number>} states one state per beard point
   * @return {string}
   */
  encode: function(states) {
    var encoded = '';
    var counter = 1;

    for (var i = 0; i < states.length; i++) {
      if (states[i] === states[i + 1]) {
        counter++;
      } else {
        encoded += counter + app.encoding.stateToLetters_(states[i]);
        counter = 1;
      }
    }

    return encoded;
  },

  /**
   * @param {string} encoded
   * @param {number} maxStates stop after this many states, however long the runs claim to be
   * @return {!Array<number>}
   */
  decode: function(encoded, maxStates) {
    var letters = app.encoding.LETTERS;
    var runMatcher = /([0-9]+)([A-Z]|[a-z][A-Za-z])/g;
    var states = [];
    var run;

    while (states.length < maxStates && (run = runMatcher.exec(encoded))) {
      var state = run[2].length === 1 ? letters.indexOf(run[2]) :
          26 + (letters.indexOf(run[2][0]) - 26) * 52 + letters.indexOf(run[2][1]);

      for (var counter = Number(run[1]); counter > 0 && states.length < maxStates; counter--) {
        states.push(state);
      }
    }

    return states;
  },

  /**
   * @param {number} state
   * @return {string}
   * @private
   */
  stateToLetters_: function(state) {
    var letters = app.encoding.LETTERS;

    if (state >= app.encoding.MAX_STATES) {
      console.error('[SantaSelfie] Beard point state ' + state + ' is too large to encode');
      return letters[0];
    }
    if (state < 26) {
      return letters[state];
    }
    return letters[26 + Math.floor((state - 26) / 52)] + letters[(state - 26) % 52];
  }
};
