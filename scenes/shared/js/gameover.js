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

goog.require('app.shared.Overlay');
goog.require('app.shared.ShareButtons');
goog.require('app.shared.SharedGame');
goog.require('app.shared.utils');

// We are *leaking* the Gameover global for backwards compatibility.
app.shared.Gameover = Gameover;

/**
 * Gameover screen.
 *
 * @param {T} game The game object.
 * @param {Element|!jQuery} elem The gameover element.
 * @template T
 * @constructor
 */
function Gameover(game, elem) {
  this.game = game;
  this.elem = app.shared.utils.unwrapElement(elem);

  this.overlay = new app.shared.Overlay(this.elem);
  new app.shared.ShareButtons(this.elem.querySelector('.shareButtons'));
  this.scoreElem = this.elem.querySelector('.gameover-score .gameover-number');
  this.levelElem = this.elem.querySelector('.gameover-level .gameover-number');

  this.elem.querySelector('.gameover-play').onclick = this._hide.bind(this);

  var playExtraBtn = this.elem.querySelector('.gameover-play-extra');
  playExtraBtn && playExtraBtn.addEventListener('click', function(e) {
    e.preventDefault();
    this._hide(e);

    if ('playExtra' in this.game) {
      this.game['playExtra']();
    }
  }.bind(this));
}

/**
 * Shows the gameover screen with an animation. Displays score and time
 * from the game.
 * @param {number=} opt_score The final score.
 * @param {number=} opt_level The final level.
 */
Gameover.prototype.show = function(opt_score, opt_level) {
  window.santaApp.fire('game-stop');

  if (this.scoreElem) {
    this.scoreElem.textContent = opt_score || this.game.scoreboard.score;
  }
  if (this.levelElem) {
    this.levelElem.textContent = opt_level || this.game.level;
  }
  this.overlay.show();
};

/**
 * Hides the gameover screen with an animation.
 * @param {!Event} ev
 */
Gameover.prototype._hide = function(ev) {
  ev.preventDefault();

  window.santaApp.fire('game-start');
  this.overlay.hide();
};
