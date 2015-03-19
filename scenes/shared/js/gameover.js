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
goog.require('app.shared.utils');

// We are *leaking* the Gameover global for backwards compatibility.
app.shared.Gameover = Gameover;

/**
 * Gameover screen.
 * @param {!Game} game The game object.
 * @param {!HTMLElement} elem The gameover element.
 * @constructor
 */
function Gameover(game, elem) {
  this.game = game;
  this.elem = $(elem);

  this.overlay = new app.shared.Overlay(this.elem);
  new app.shared.ShareButtons(this.elem.find('.shareButtons'));
  this.scoreElem = this.elem.find('.gameover-score .gameover-number');
  this.levelElem = this.elem.find('.gameover-level .gameover-number');

  this.attachEvents_();
}

/**
 * Attaches events to the gameover screen.
 * @private
 */
Gameover.prototype.attachEvents_ = function() {
  this.elem.find('.gameover-play').on('click', function(e) {
    e.preventDefault();

    this.hide();
    this.game.restart();
  }.bind(this));
};

/**
 * Shows the gameover screen with an animation. Displays score and time
 * from the game.
 * @param {number} score The final score.
 * @param {number} level The final level.
 */
Gameover.prototype.show = function(score, level) {
  this.scoreElem.text(score || this.game.scoreboard.score);
  this.levelElem.text(level || this.game.level);
  this.overlay.show();
};

/**
 * Hides the gameover screen with an animation.
 * @param {function} callback Runs when the animation is finished.
 */
Gameover.prototype.hide = function(callback) {
  this.overlay.hide(callback);
};
