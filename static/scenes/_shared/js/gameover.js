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

/**
 * Gameover screen. Just calls out to global.
 */
app.shared.Gameover = class Gameover {

  /**
   * @param {T} game The game object.
   * @param {jQuery|!Element|boolean=} playExtra whether there's more levels to play
   * @template T
   */
  constructor(game, playExtra=false) {
    this.game = game;
    this._hasPlayExtra = typeof playExtra === 'boolean' && playExtra;
  }

  /**
   * Shows the gameover screen with an animation. Displays score and time from the game.
   *
   * @param {number=} opt_score The final score.
   * @param {number=} opt_level The final level.
   */
  show(opt_score, opt_level) {
    const detail = {
      score: opt_score || (this.game && this.game.scoreboard && this.game.scoreboard.score) || 0,
      level: opt_level || 0,
      hasPlayExtra: this._hasPlayExtra,
    };
    window.santaApp.fire('game-stop', detail);
  }
};
