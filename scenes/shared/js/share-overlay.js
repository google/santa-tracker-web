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

  this.closeElem.addEventListener('click', this.hide.bind(this, null));
  this.urlElem.addEventListener('click', this.selectUrl.bind(this));
};

/**
 * Select the input box's entire contents.
 */
app.shared.ShareOverlay.prototype.selectUrl = function() {
  this.urlElem.select();
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

  window.santaApp.fire('analytics-track-share', null);

  // delay until after the overlay is visible
  window.setTimeout(function() {
    this.selectUrl();
  }.bind(this), 0);
};

/**
 * Shorten a url with Google shortener.
 * @param {string} url The long url.
 * @param {function(string)} callback Call this function with the shortened url.
 * @private
 */
app.shared.ShareOverlay.prototype.shorten_ = function(url, callback) {
  var x = new XMLHttpRequest();
  x.open('POST', 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyA4LaOn5d1YRsJIOTlhrm7ONbuJ4fn7AuE')
  x.onload = function() {
    var shortUrl = null;
    try {
      var json = JSON.parse(x.responseText);
      shortUrl = json['id'];
    } catch (e) {}
    callback(shortUrl || url);
  };
  x.setRequestHeader('Content-Type', 'application/json');
  x.send(JSON.stringify({longUrl: url}));
};

/**
 * Hides the share screen with an animation.
 * @param {function()=} opt_callback Runs when the animation is finished.
 */
app.shared.ShareOverlay.prototype.hide = function(opt_callback) {
  this.overlay.hide(opt_callback);
};
