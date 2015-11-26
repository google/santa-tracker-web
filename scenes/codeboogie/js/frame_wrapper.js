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

goog.provide('app.FrameWrapper');

goog.require('app.Scoreboard');
goog.require('app.shared.FrameRPC');
goog.require('app.shared.Gameover');
goog.require('app.Sequencer');

/**
 * IFrame proxy class.
 * Handles all the postMessage communication.
 * @param {!Element} el DOM element containing the scene.
 * @param {string} staticDir where the scene's frame can be found.
 * @constructor
 * @export
 */
app.FrameWrapper = function(el, staticDir) {
  this.staticDir = staticDir;
  this.el = $(el);
  this.gameoverView = new app.shared.Gameover(this, this.el.find('.gameover'));
  this.scoreboardView = new app.Scoreboard(this.el.find('.board'), 10);
  this.gameStartTime = +new Date;
  this.iframeEl = this.el.find('iframe[data-codeboogie-frame]');
  this.isPlaying = false;
  this.sequencer = new app.Sequencer();

  // Create a communication channel to the game frame.
  this.iframeChannel = new app.shared.FrameRPC(this.iframeEl[0].contentWindow, {
    gameover: this.gameover.bind(this),
    iframeFocusChange: this.iframeFocusChange.bind(this),
    setLevel: this.setLevel.bind(this),
    triggerSound: this.triggerSound.bind(this),
    setTrack: this.setTrack.bind(this)
  });

  // internal level number for analytics
  this.level_ = 1;

  // Load the iframe.
  this.setIframeSrc();
};

/**
 * Starts the scene.
 */
app.FrameWrapper.prototype.start = function() {
  this.sequencer.start();

  // Too soon for postMessage.
  this.restart();
};

/**
 * Restarts the game
 */
app.FrameWrapper.prototype.restart = function() {
  this.isPlaying = true;

  this.iframeChannel.call('restart');
  window.santaApp.fire('analytics-track-game-start', {gameid: 'codeboogie'});

  this.sequencer.onBeat = (beat, bpm) => this.iframeChannel.call('beat', beat, bpm);
};

/**
 * Destructor.
 */
app.FrameWrapper.prototype.dispose = function() {
  if (this.isPlaying) {
    window.santaApp.fire('analytics-track-game-quit', {gameid: 'codeboogie',
        timePlayed: new Date - this.gameStartTime,
        level: this.level_});
  }

  this.iframeChannel.dispose();
  this.iframeEl = null;
};

/**
 * Loads the gameplay frame into the iframe.
 */
app.FrameWrapper.prototype.setIframeSrc = function() {
  var filename = window.DEVMODE ? 'index.html' : 'codeboogieframe-scene_' + document.documentElement.lang + '.html';
  this.iframeEl.attr('src', this.staticDir + '../codeboogieframe/' + filename + location.search);
};

app.FrameWrapper.prototype.triggerSound = function(event) {
  window.santaApp.fire('sound-trigger', {name: event, args: []})
};

/**
 * Triggers the shared game over view.
 */
app.FrameWrapper.prototype.gameover = function() {
  this.isPlaying = false;

  this.gameoverView.show(1000, 10);

  window.santaApp.fire('analytics-track-game-over', {
    gameid: 'codeboogie',
    score: 0,
    level: 10,
    timePlayed: new Date - this.gameStartTime
  });
};

/**
 * Takes any iframe focus state changes and passes them on to santaApp.
 * @param {string} state Focus state. Either 'focus' or 'blur'.
 */
app.FrameWrapper.prototype.iframeFocusChange = function(state) {
  if (state === 'focus' || state === 'blur') {
    window.santaApp.fire('iframe-focus-change', state);
  }
};

/**
 * Updates the level in the scoreboard.
 * @param {number} level which level is it.
 * @param {number} bpm of level.
 */
app.FrameWrapper.prototype.setLevel = function(level, bpm) {
  this.level_ = level;
  this.scoreboardView.setLevel(level);
  this.sequencer.setLevel(level, bpm);
};

/**
 * Select idle or dancing track.
 * @param {number} idle = 0, dancing = 1.
 */
app.FrameWrapper.prototype.setTrack = function(track) {
  this.sequencer.setTrack(track);
};
