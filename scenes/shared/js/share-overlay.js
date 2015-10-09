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

goog.provide('app.shared.ShareOverlay');

goog.require('app.shared.Overlay');
goog.require('app.shared.ShareButtons');
goog.require('app.shared.utils');

/**
 * Gameover screen.
 * @param {!Element|!jQuery} elem The gameover element.
 * @constructor
 * @struct
 */
app.shared.ShareOverlay = function(elem) {
  this.elem = app.shared.utils.unwrapElement(elem);

  this.overlay = new app.shared.Overlay(this.elem);
  this.shareButtons = new app.shared.ShareButtons(this.elem.querySelector('.shareButtons'));

  this.closeElem = this.elem.querySelector('.shareOverlay-close');
  this.urlElem = this.elem.querySelector('.shareOverlay-url');

  if (window.gapi && window.gapi.client) {
    this.urlShortener = window.gapi.client.load('urlshortener', 'v1');
  }

  var hideFn = this.hide.bind(this);
  var selectFn = function() {
    // Use various approaches to select the text. Delay by a frame to work
    // around an apparent IE10 bug.
    window.setTimeout(function() {
      // TODO(thorogood): Factor this out to a helper function.
      if ('select' in this) {
        this.select();
      } else {
        this.setSelectionRange(0, this.value.length);
      }
    }.bind(this), 0);
  }.bind(this.urlElem);

  ['click', 'touchend'].forEach(function(name) {
    this.closeElem.addEventListener(name, hideFn);
    this.urlElem.addEventListener(name, selectFn);
  }, this);
};

/**
 * Shows the share screen with an animation.
 * @param {string} url The url to share.
 * @param {boolean} shorten Should the url be shortened?
 */
app.shared.ShareOverlay.prototype.show = function(url, shorten) {
  if (!url) {
    throw new Error('No url to share.');
  }

  // Shorten url
  if (shorten) {
    this.shorten_(url, function(shortened) {
      this.show(shortened, false);
    }.bind(this));
    return;
  }

  this.urlElem.value = url.replace(/https?:\/\//i, '');
  this.shareButtons.setUrl(url);
  this.overlay.show();
};

/**
 * Shorten a url with Google shortener.
 * @param {string} url The long url.
 * @param {function(string)} callback Call this function with the shortened url.
 * @private
 */
app.shared.ShareOverlay.prototype.shorten_ = function(url, callback) {
  if (!window.gapi || !window.gapi.client) {
    callback(url);
    return;
  }

  if (!this.urlShortener) {
    this.urlShortener = window.gapi.client.load('urlshortener', 'v1');
  }

  this.urlShortener.then(function() {
    window.gapi.client.urlshortener.url.insert({
      resource: {
        longUrl: url
      }
    }).execute(function(response) {
      if (!response.id) {
        console.debug('URL shortener service failed, using raw URL');
        callback(url);
      } else {
        callback(response.id);
      }
    });
  });
};

/**
 * Hides the share screen with an animation.
 * @param {function()=} opt_callback Runs when the animation is finished.
 */
app.shared.ShareOverlay.prototype.hide = function(opt_callback) {
  this.overlay.hide(opt_callback);
};
