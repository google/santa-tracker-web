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
'use strict';

goog.provide('app.Game');

goog.require('app.Constants');
goog.require('app.view.SplashView');
goog.require('app.GameController');

/**
 * Main game class
 * @param {!Element} elem An DOM element which wraps the game.
 * @constructor
 * @struct
 * @export
 */
app.Game = function(elem, importPath) {
  this.elem = $(elem);

  this.splashView = new app.view.SplashView(this.elem);
  this.gameController = new app.GameController(this.elem, importPath);
};

app.Game.prototype.start = function() {
  // Game Controller
  this.gameController.prepareGame();
  this.gameController.prepareNewGame();
  this.gameController.addListener('GAME_END', function() {
    this.showSplashscreen();
  }.bind(this));

  //Splash view
  this.splashView.showView();
  this.splashView.addListener('START_GAME', function() {
    this.startGame();
    window.santaApp.fire('sound-ambient', 'music_start_ingame');
  }.bind(this));
};

app.Game.prototype.dispose = function() {
  this.gameController.exitGame();
};

app.Game.prototype.startGame = function() {
  this.gameController.prepareNewGame( function(challenge) {
    this.gameController.startNewGameWithChallenge(challenge, {
      onCardDismiss: function () {
        this.splashView.hideView();
        this.gameController.showView();
      }.bind(this)
    });
  }.bind(this));
};

app.Game.prototype.showSplashscreen = function() {
  this.gameController.hideView();
  this.splashView.showView();
};
