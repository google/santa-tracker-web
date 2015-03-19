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

goog.provide('app.Scene');

goog.require('app.IframeProxy');
goog.require('app.shared.Scoreboard');

/**
 * Main game class.
 * @param {Element} el DOM element containing the scene.
 * @constructor
 * @export
 */
app.Scene = function(el) {
  this.$el = $(el);
  this.controlsEl = this.$el.find('.actions')[0];
  this.$pausePlay = this.$el.find('.actions .pause');
  this.$sound = $('#sound');
  this.iframeProxy = new app.IframeProxy(this, this.$el);
  this.scoreboard = new app.shared.Scoreboard(this, this.$el.find('.board'));
  this.isPaused = false;
};

/**
 * Initialization.
 * @export
 */
app.Scene.prototype.init = function() {
  this.iframeProxy.init();
  this.attachEvents();
  this.$sound.hide();

  // TODO: Make mute state accessible
  /*if (window.hasOwnProperty('santatracker') &&
    window.santatracker.hasOwnProperty('muteState') &&
    !window.santatracker.muteState.isMuted()) {
    this.mute();
  }

  if (window.hasOwnProperty('santatracker') &&
    window.santatracker.hasOwnProperty('muteState') &&
    window.santatracker.muteState.isMuted()) {
    this.unMute();
  }*/
};

/**
 * Destructor.
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.iframeProxy.destroy();
  this.detachEvents();
  this.isPaused = null;
};

/**
 * Adds the event listeners to this module.
 */
app.Scene.prototype.attachEvents = function() {
  // TODO: Make mute state accessible
  /*if (window.hasOwnProperty('santatracker') &&
    window.santatracker.hasOwnProperty('muteState')) {

    window.santatracker.muteState.addListener(function(muted) {
      if (muted) {
        this.mute();
      } else {
        this.unMute();
      }
    }.bind(this));
  }*/
};

/**
 * Removes the event listeners from this module.
 */
app.Scene.prototype.detachEvents = function() {
};

/**
 * Posts to the iframe to mute.
 */
app.Scene.prototype.mute = function() {
  this.iframeProxy.postMessage('mute');

};

/**
 * Posts to the iframe to unmute.
 */
app.Scene.prototype.unMute = function() {
  this.iframeProxy.postMessage('unmute');
};

/**
 * Posts to the iframe to pause or unpause
 * depending on the current state.
 */
app.Scene.prototype.togglePause = function() {
  if (this.isPaused) {
    this.iframeProxy.postMessage('play');
    this.isPaused = false;
  } else {
    this.iframeProxy.postMessage('pause');
    this.isPaused = true;
  }
};

/**
 * Posts to the iframe to restart the scene.
 */
app.Scene.prototype.restart = function() {
  this.iframeProxy.postMessage('replay');
};


//
// Callbacks from the iframe
//

/**
 * iFrame telling us the window is loaded.
 * Show the $sound control because now you can mute/unmute it.
 */
app.Scene.prototype.onLoadedMessage = function() {
  this.$sound.show();
};

/**
 * iFrame telling us to show the controls.
 */
app.Scene.prototype.onShowControlsMessage = function() {
  this.controlsEl.removeAttribute('hidden');
};

/**
 * iFrame telling us to hide the controls.
 */
app.Scene.prototype.onHideControlsMessage = function() {
  this.controlsEl.setAttribute('hidden', '');
};

/**
 * iFrame telling us to show the play button.
 */
app.Scene.prototype.onShowPlayMessage = function() {
  this.onHidePauseMessage();
};

/**
 * iFrame telling us to hide the play button.
 */
app.Scene.prototype.onHidePlayMessage = function() {
  this.onShowPauseMessage();
};

/**
 * iFrame telling us to show the pause button.
 */
app.Scene.prototype.onShowPauseMessage = function() {
  this.$pausePlay.removeClass(Constants.CLASS_PAUSED);
};

/**
 * iFrame telling us to hide the pause button.
 */
app.Scene.prototype.onHidePauseMessage = function() {
  this.$pausePlay.addClass(Constants.CLASS_PAUSED);
};

/**
 * iFrame telling us to show the mute button.
 */
app.Scene.prototype.onShowMuteMessage = function() {
};

/**
 * iFrame telling us to hide the mute button.
 */
app.Scene.prototype.onHideMuteMessage = function() {
};

/**
 * iFrame telling us to show the unmute button.
 */
app.Scene.prototype.onShowUnmuteMessage = function() {
};

/**
 * iFrame telling us to hide the unmute button.
 */
app.Scene.prototype.onHideUnmuteMessage = function() {
};
