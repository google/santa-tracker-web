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

/**
 * Main game class.
 * @param {!Element} el DOM element containing the scene.
 * @constructor
 * @struct
 * @export
 */
app.Scene = function(el) {
  this.$el = $(el);
  this.controlsEl = this.$el.find('.actions')[0];
  this.iframeProxy = new app.IframeProxy(this, el);
};

/**
 * Initialization.
 * @export
 */
app.Scene.prototype.init = function() {
  this.iframeProxy.init();
};

/**
 * Destructor.
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.iframeProxy.destroy();
};

/**
 * Posts to the iframe to mute or unmute.
 * @param {boolean} mute whether to mute or unmute
 */
app.Scene.prototype.setMute = function(mute) {
  this.iframeProxy.postMessage(mute ? 'mute' : 'unmute');
}

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
 */
app.Scene.prototype.onLoadedMessage = function() {
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
};

/**
 * iFrame telling us to hide the pause button.
 */
app.Scene.prototype.onHidePauseMessage = function() {
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
