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

goog.provide('app.IframeProxy');

goog.require('app.Constants');

/**
 * Iframe proxy class.
 * Handles all the postMessage communication.
 * @param {app.Scene} scene The scene.
 * @param {Element} el DOM element containing the scene.
 * @constructor
 */
app.IframeProxy = function(scene, el) {
  this.scene = scene;
  this.$el = $(el);
  this.$iframe = this.$el.find('#santa-iframe');
};

/**
 * Initialization.
 */
app.IframeProxy.prototype.init = function() {
  this.setIframeSrc();
  this.attachEvents();
};

/**
 * Destructor.
 */
app.IframeProxy.prototype.destroy = function() {
  this.detachEvents();
  this.$iframe = null;
};

/**
 * Adds the event listeners to this module.
 */
app.IframeProxy.prototype.attachEvents = function() {
  if(!!window.postMessage) {
    window.addEventListener("message", this.onReceiveMessage.bind(this), false);
  }
};

/**
 * Removes the event listeners from this module.
 */
app.IframeProxy.prototype.detachEvents = function() {
  if(!!window.postMessage) {
    window.removeEventListener("message", this.onReceiveMessage, false);
  }
};

/**
 * Loops through the href string from the URL
 * and tries to find a 'k=' part.
 * e.g ?a=b&c=d&k=hey
 */
app.IframeProxy.prototype.getUrlKey = function() {
  var i = null;
  var locationHrefArr = window.location.href.split('?');

  for (i = 0; i < locationHrefArr.length; i++) {
    var key = locationHrefArr[i].split('=');
    // looking for "k" key
    if (key[0].match(/\bk\b/)) {
      // that's our guy
      // get the value
      return key[1];
    }
  }
};

/**
 * Posts a message to the iframe
 **/
app.IframeProxy.prototype.postMessage = function(message) {
  this.$iframe[0].contentWindow.postMessage(message, Constants.VARITALK_URL);
};

/**
 * Sets the iframe src with or without a key.
 */
app.IframeProxy.prototype.setIframeSrc = function() {
  var key = this.getUrlKey();
  var params = '?l=' + encodeURIComponent($('html').attr('lang')) + '&';

  if (key && key.length > 0) {
    params += 'k=' + key;
  }

  this.$iframe.attr('src', app.Constants.VARITALK_URL + params);
};


/**
 * Callback for when we have received a message from the iframe.
 */
app.IframeProxy.prototype.onReceiveMessage = function(event) {
  switch(event.data) {
    case 'loaded':
      if (typeof this.scene.onLoadedMessage === 'function') {
        this.scene.onLoadedMessage();
      }
      break;
    case 'show_controls':
      if (typeof this.scene.onShowControlsMessage === 'function') {
        this.scene.onShowControlsMessage();
      }
      break;
    case 'hide_controls':
      if (typeof this.scene.onHideControlsMessage === 'function') {
        this.scene.onHideControlsMessage();
      }
      break;
    case 'show_play':
      if (typeof this.scene.onShowPlayMessage === 'function') {
        this.scene.onShowPlayMessage();
      }
      break;
    case 'hide_play':
      if (typeof this.scene.onHidePlayMessage === 'function') {
        this.scene.onHidePlayMessage();
      }
      break;
    case 'show_pause':
      if (typeof this.scene.onShowPauseMessage === 'function') {
        this.scene.onShowPauseMessage();
      }
      break;
    case 'hide_pause':
      if (typeof this.scene.onHidePauseMessage === 'function') {
        this.scene.onHidePauseMessage();
      }
      break;
    case 'show_mute':
      if (typeof this.scene.onShowMuteMessage === 'function') {
        this.scene.onShowMuteMessage();
      }
      break;
    case 'hide_mute':
      if (typeof this.scene.onHideMuteMessage === 'function') {
        this.scene.onHideMuteMessage();
      }
      break;
    case 'show_unmute':
      if (typeof this.scene.onShowUnmuteMessage === 'function') {
        this.scene.onShowUnmuteMessage();
      }
      break;
    case 'hide_unmute':
      if (typeof this.scene.onHideUnmuteMessage === 'function') {
        this.scene.onHideUnmuteMessage();
      }
      break;
  }
};
