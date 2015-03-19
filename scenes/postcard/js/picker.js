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
 * Manages the background and foreground picker.
 * @constructor
 * @param {Scene} scene The scene object.
 */
app.Picker = function(scene) {
  this.elem = scene.elem;
  this.foreground = scene.foreground;
  this.background = scene.background;

  this.attachEvents_();
};

/**
 * Attaches events for picker interactions.
 * @private
 */
app.Picker.prototype.attachEvents_ = function() {
  this.elem.find('.fgs-up').on('click', this.handleChange_(0, -1));
  this.elem.find('.fgs-down').on('click', this.handleChange_(0, 1));
  this.elem.find('.bgs-left').on('click', this.handleChange_(-1, 0));
  this.elem.find('.bgs-right').on('click', this.handleChange_(1, 0));
};

/**
 * Create event handler to change background and foreground
 * @private
 * @param {number} bg This number is added to the selected background.
 * @param {number} fg This number is added to the selected foreground.
 * @return {function} event handler
 */
app.Picker.prototype.handleChange_ = function(bg, fg) {
  return function(e) {
    e.preventDefault();

    this.navigate(bg, fg);
  }.bind(this);
};

/**
 * Go to a different foreground or background
 * @param {number} bg This number is added to the selected background.
 * @param {number} fg This number is added to the selected foreground.
 */
app.Picker.prototype.navigate = function(bg, fg) {
  var bgNum = this.background.getPosition(bg),
      fgNum = this.foreground.getPosition(fg),
      url = window.location.href,
      hash = window.location.hash;
  
  window.history.pushState(null, '', url.substr(0, url.length - hash.length) + '#postcard?bg=' + bgNum + '&fg=' + fgNum);
  this.fromUrl(bgNum, fgNum);
  
  // Sound
  if (bg !== 0) {
    window.santaApp.fire('sound-trigger', {
      name: 'sm_change_bg',
      args: [bgNum]
    });
  } else if (fg !== 0) {
    window.santaApp.fire('sound-trigger', {
      name: 'sm_change_fg',
      args: [fgNum]
    });
  }
};

/**
 * Get parameters from the url.
 * @param {string} bg The background parameter.
 * @param {string} fg The foreground parameter.
 */
app.Picker.prototype.fromUrl = function(bg, fg) {
  this.background.set(parseInt(bg, 10));
  this.foreground.set(parseInt(fg, 10));
};
