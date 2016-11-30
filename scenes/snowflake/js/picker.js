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

goog.provide('app.Picker');

goog.require('app.I18n');
goog.require('app.Constants');

/**
 * Manages the background picker.
 * @constructor
 * @param {!Scene} scene The scene object.
 */
app.Picker = function(scene) {
  this.elem = scene.elem;
  this.background = scene.background;

  this.attachEvents_();

  const params = getUrlParameters();
  if ('bg' in params) {
    this.background.set(+params.bg);
    this.updateMessage(params.bg);
  } else {
    this.background.set(app.Constants.DEFAULT_BACKGROUND);
    this.updateMessage(app.Constants.DEFAULT_BACKGROUND);
  }
};

/**
 * Attaches events for picker interactions.
 * @private
 */
app.Picker.prototype.attachEvents_ = function() {
  this.elem.find('.bgs-left').on('click', this.handleChange_(-1));
  this.elem.find('.bgs-right').on('click', this.handleChange_(1));
};

/**
 * Create event handler to change background
 * @private
 * @param {number} bg This number is added to the selected background.
 * @return {function} event handler
 */
app.Picker.prototype.handleChange_ = function(bg) {
  return function(e) {
    e.preventDefault();

    this.navigate(bg);
  }.bind(this);
};

/**
 * Go to a different background
 * @param {number} bgDelta This number is added to the selected background.
 */
app.Picker.prototype.navigate = function(bgDelta) {
  const bg = this.background.getPosition(bgDelta);

  const url = new URL(window.location.toString());
  url.search = `?bg=${bg}`;
  window.history.replaceState(null, '', url.toString());

  this.background.set(bg);
  this.updateMessage(bg);

  // Sound
  if (bgDelta !== 0) {
    window.santaApp.fire('sound-trigger', {
      name: 'sm_change_bg',
      args: [bg]
    });
  }
};

/**
 * Change message to match background
 * @param {number} bg This number is added to the selected background.
 */
app.Picker.prototype.updateMessage = function(bg) {
  var colors = ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'];
  var messages = [0, 1, 2, 3, 0, 1, 2, 3]
  var messageId = messages[bg - 1];
  document.getElementById("text-span").innerHTML = app.I18n.getMsg('S_message' + messageId);
  document.getElementById("text-span").style.color = colors[bg - 1];
}
