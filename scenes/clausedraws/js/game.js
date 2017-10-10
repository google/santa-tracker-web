/*
 * Copyright 2017 Google Inc. All rights reserved.
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

goog.require('app.Canvas');
goog.require('app.Mouse');
goog.require('app.Tools');
goog.require('app.shared.ShareOverlay');



/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @export
 */
app.Game = function(elem) {
  this.elem = $(elem);
  this.gameStartTime = null;
  this.sceneElem = this.elem.find('.scene');

  var canvas = this.sceneElem.find('#draw-canvas')[0];

  this.mouse = new app.Mouse(this.sceneElem);
  this.canvas = new app.Canvas(this, canvas);

  // Construct app.Tools last, as it needs mouse/canvas.
  this.tools = new app.Tools(this, this.sceneElem);

  this.shareOverlay = new app.shared.ShareOverlay(this.elem.find('.shareOverlay'));

  this.interactionDoneTimeout_ = 0;
  this.initialCanvas_ = '';
};


/**
 * Start the game
 * @export
 */
app.Game.prototype.start = function() {
  this.tools.start();
  this.canvas.start();

  this.mouse.subscribe(this.tools.mouseChanged, this.tools);
  this.mouse.subscribe(this.canvas.mouseChanged, this.canvas);

  this.elem.find('#share-button, #share-button-toolbox').
    on('click.clausedraws touchend.clausedraws', this.showShareOverlay.bind(this));

  this.elem.find('#reset-button, #reset-button-toolbox').
    on('click.clausedraws touchend.clausedraws', this.resetCanvas_.bind(this));

  this.restart();

  this.initialCanvas_ = this.canvas.save();

  var canvas = getUrlParameter('canvas');
  canvas && this.canvas.restore(canvas);
};


/**
 * Resets the canvas to original state.
 * @private
 */
app.Game.prototype.resetCanvas_ = function() {
  this.canvas.resetCanvas();
  this.updateUrlState_();
};


/**
 * Resets all game entities and restarts the game. Can be called at any time.
 */
app.Game.prototype.restart = function() {
  this.paused = false;
  this.unfreezeGame();

  window.santaApp.fire('analytics-track-game-start', {gameid: 'clausedraws'});
  this.gameStartTime = +new Date;
};


/**
 * Show share overlay.
 */
app.Game.prototype.showShareOverlay = function() {
  var urlString = '';
  window.clearTimeout(this.interactionDoneTimeout_);
  this.updateUrlState_();
  this.shareOverlay.show(urlString, true);
};


/**
 * Called when interaction is done. Defers setting canvas state for a time.
 */
app.Game.prototype.interactionDone = function() {
  window.clearTimeout(this.interactionDoneTimeout_);
  this.interactionDoneTimeout_ =
      window.setTimeout(() => this.updateUrlState_(), app.Constants.INTERACTION_URL_DELAY);
};


/**
 * Replaces the current URL state with Santa's canvas contents.
 */
app.Game.prototype.updateUrlState_ = function() {
  const s = this.canvas.save();
  const url = new URL(window.location.toString());

  if (s === this.initialCanvas_) {
    url.search = '';
  } else {
    url.search = '?canvas=' + window.encodeURIComponent(s);
  }
  window.history.replaceState(null, '', url.toString());
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
  }
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
 * Dispose the game.
 * @export
 */
app.Game.prototype.dispose = function() {
  if (this.isPlaying) {
    var opts = {
      gameid: 'clausedraws',
      timePlayed: new Date - this.gameStartTime,
      level: 1
    };
    window.santaApp.fire('analytics-track-game-quit', opts);
  }
  this.freezeGame();

  $(window).off('.clausedraws');
  $(document).off('.clausedraws');
};
