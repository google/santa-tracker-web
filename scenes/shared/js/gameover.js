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

goog.provide('app.shared.Gameover');

// We are *leaking* the Gameover global for backwards compatibility.
app.shared.Gameover = Gameover;

/**
 * Gameover screen.
 *
 * @param {T} game The game object.
 * @param {*} elem The gameover element, ignored.
 * @template T
 * @constructor
 */
function Gameover(game, elem) {
  this.game = game;
  this._hasPlayExtra = game && 'playExtra' in this.game;
}

/**
 * Shows the gameover screen with an animation. Displays score and time
 * from the game.
 * @param {number=} opt_score The final score.
 * @param {number=} opt_level The final level, ignored.
 * @param {boolean=} opt_playExtra Whether to show play extra option.
 */
Gameover.prototype.show = function(opt_score, opt_level, opt_playExtra) {
  const detail = {
    score: opt_score || (this.game && this.game.scoreboard && this.game.scoreboard.score) || 0,
    hasPlayExtra: this._hasPlayExtra && opt_playExtra,
  };
  window.santaApp.fire('game-stop', detail);
};
