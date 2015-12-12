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
goog.require('app.shared.ShareOverlay');
goog.require('app.Sequencer');
goog.require('app.ChooseMode');

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
  this.chooseMode = new app.ChooseMode(this.el.find('.choose-mode'), this.el.find('.choose-stage'));
  this.gameoverView = new app.shared.Gameover(this, this.el.find('.gameover'));
  this.scoreboardView = new app.Scoreboard(this.el.find('.board'), 10);
  this.gameStartTime = +new Date;
  this.iframeEl = this.el.find('iframe[data-codeboogie-frame]');
  this.isPlaying = false;
  /** @type {app.shared.ShareOverlay} */
  this.shareOverlay = null;

  // Create a communication channel to the game frame.
  this.iframeChannel = new app.shared.FrameRPC(this.iframeEl[0].contentWindow, {
    gameover: this.gameover.bind(this),
    iframeFocusChange: this.iframeFocusChange.bind(this),
    setLevel: this.setLevel.bind(this),
    triggerSound: this.triggerSound.bind(this),
    share: this.share.bind(this),
    setVariant: this.setVariant.bind(this)
  });

  this.sequencer = new app.Sequencer();
  this.sequencer.onBeat = (beat, bpm) => this.iframeChannel.call('beat', beat, bpm);

  // internal level number for analytics
  this.level_ = 1;

  // Load the iframe.
  this.setIframeSrc();
};

/**
 * Starts the scene.
 *
 * @param {{dance: string, level: string}} params
 */
app.FrameWrapper.prototype.start = function(params) {
  this.sequencer.start();

  this.restart(params);
};

/**
 * Restarts the game
 *
 * @param {{dance: string, level: string}} params
 */
app.FrameWrapper.prototype.restart = function(params) {
  this.isPlaying = true;
  params = params || {};

  if (params.dance) {
    this.startMode('custom', params.dance);
    this.setLevelClass('custom');
  } else {
    this.chooseMode.show((mode, stage) => {
      this.setLevelClass(mode);
      this.startMode(mode, mode === 'freestyle' ? stage : params.level);
    });
  }
};

/**
 * Set a class on the game element so we know which mode we're in.
 *
 * @param {string} mode identifier. Can be teacher, freestyle or custom.
 */
app.FrameWrapper.prototype.setLevelClass = function(mode) {
  // Remove any classes that start with level--
  var domEl = this.el[0];
  var classes = domEl.className.split(' ')
    .filter(c => c.lastIndexOf('level--', 0) !== 0);

  classes.push(`level--${mode}`);

  domEl.className = classes.join(' ').trim();
};

/**
 * Starts a specific game mode.
 *
 * @param {string} mode identifier. Can be teacher, freestyle or custom.
 * @param {?string} customLevel serialized.
 */
app.FrameWrapper.prototype.startMode = function(mode, customLevel) {
  this.iframeChannel.call('restart', mode, customLevel);
  window.santaApp.fire('analytics-track-game-start', {gameid: 'codeboogie'});
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
 * Opens share dialog with a given query string.
 *
 * @param {string} query string to share.
 */
app.FrameWrapper.prototype.share = function(query) {
  // Lazy load share overlay. Google API should be ready by then.
  if (!this.shareOverlay) {
    this.shareOverlay = new app.shared.ShareOverlay(
        this.el.find('.shareOverlay'));
  }

  var newHref = location.href.substr(0,
      location.href.length - location.hash.length) + '#codeboogie' + query;
  window.history.pushState(null, '', newHref);
  this.shareOverlay.show(newHref, true);
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
 * @param {number} track which music track to play.
 * @param {number} bpm of level.
 */
app.FrameWrapper.prototype.setLevel = function(level, track, bpm) {
  this.level_ = level;
  this.scoreboardView.setLevel(level);
  this.sequencer.setTrack(track, bpm);
};

/**
 * Select idle or dancing track variant.
 * @param {number} variant idle = 0, dancing = 1.
 */
app.FrameWrapper.prototype.setVariant = function(variant) {
  this.sequencer.setVariant(variant);
};
