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

goog.provide('app.shared.ShareButtons');

goog.require('app.shared.utils');

/**
 * Share buttons.
 * @param {!HTMLElement|!jQuery} elem The share buttons element.
 * @param {string=} opt_url The url to share.
 * @constructor
 */
app.shared.ShareButtons = function(elem, opt_url) {
  this.elem = app.shared.utils.unwrapElement(elem);
  this.setUrl(opt_url);

  // Open in a popup
  var all = [].slice.call(elem.querySelectorAll('a'));
  all.forEach(function(link) {
    link.addEventListener('click', this.handleClick_);
  }, this);
};

/**
 * Change the url to share.
 * @param opt_url {string=} The url. If blank, uses current location..
 */
app.shared.ShareButtons.prototype.setUrl = function(opt_url) {
  var url = window.encodeURIComponent(opt_url || window.location.href);
  this.elem.querySelector('a.shareButtons-google').href =
      'https://plus.google.com/share?url=' + url;
  this.elem.querySelector('a.shareButtons-facebook').href =
      'https://www.facebook.com/sharer.php?p[url]=' + url + '&u=' + url;
  this.elem.querySelector('a.shareButtons-twitter').href =
      'https://twitter.com/share?hashtags=santatracker&url=' + url;
};

/**
 * Open the share dialogs in a popup window.
 * @param event {!Event} The click event.
 * @this {!HTMLLinkElement}
 * @private
 */
app.shared.ShareButtons.prototype.handleClick_ = function(event) {
  event.preventDefault();
  var width = 600;
  var height = 600;

  if (this.classList.contains('shareButtons-twitter')) {
    height = 253;
  } else if (this.classList.contains('shareButtons-facebook')) {
    height = 229;
  } else if (this.classList.contains('shareButtons-google')) {
    height = 348;
    width = 512;
  }

  var options = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=' + height + ',width=' + width;
  window.open(this.href, '', options);
};
