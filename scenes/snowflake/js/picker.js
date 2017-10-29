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

goog.require('app.Constants');

/**
 * Manages the background picker.
 * @constructor
 * @param {!app.Scene} scene The scene object.
 * @param {!Object<string, string>} strings
 */
app.Picker = function(scene, strings) {
  this.scene = scene;
  this.strings = strings;
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
 * @return {function(!jQuery.Event)} event handler
 */
app.Picker.prototype.handleChange_ = function(bg) {
  return (e) => {
    e.preventDefault();
    this.navigate(bg);
  };
};

/**
 * Go to a different background
 * @param {number} bgDelta This number is added to the selected background.
 */
app.Picker.prototype.navigate = function(bgDelta) {
  const bg = this.background.getPosition(bgDelta);

  this.background.set(bg);
  this.updateMessage(bg);

  this.scene.updateUrl();

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
  var text = this.elem[0].querySelector('#text-span');
  // Fade out
  text.style.opacity = 0;

  // Fade in
  window.setTimeout(() => {
    var colors = ['#0a459b', 'white', 'white', '#0a459b', 'white', 'white', '#0a459b', 'white'];
    var messages = [0, 1, 2, 3, 0, 1, 2, 3];
    var messageId = messages[bg - 1];
    text.textContent = this.strings['snowflake_message' + messageId] || 'Unknown: ' + messageId;
    text.style.color = colors[bg - 1];
    text.style.opacity = 1;
  }, 150);
}
