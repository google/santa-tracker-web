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
  var selectedMessages = ["holiday_message_0", "holiday_message_3", "holiday_message_4", "holiday_message_5"];
  var colors = ['white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white'];
  var messageId = (bg - 1)%4;
  document.getElementById("i18ntext").msgid = selectedMessages[messageId];
  var elements = document.querySelectorAll(".message-text");
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.color = colors[bg - 1];
  }
}
