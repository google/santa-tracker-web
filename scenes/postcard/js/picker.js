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
 * @param {!Scene} scene The scene object.
 */
app.Picker = function(scene) {
  this.elem = scene.elem;
  this.foreground = scene.foreground;
  this.background = scene.background;

  this.attachEvents_();

  const params = getUrlParameters();
  if ('bg' in params && 'fg' in params) {
    this.background.set(+params.bg);
    this.foreground.set(+params.fg);
  }
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
 * @param {number} bgDelta This number is added to the selected background.
 * @param {number} fgDelta This number is added to the selected foreground.
 */
app.Picker.prototype.navigate = function(bgDelta, fgDelta) {
  const bg = this.background.getPosition(bgDelta);
  const fg = this.foreground.getPosition(fgDelta);

  const url = new URL(window.location.toString());
  url.search = `?bg=${bg}&fg=${fg}`;
  window.history.replaceState(null, '', url.toString());

  this.background.set(bg);
  this.foreground.set(fg);

  // Sound
  if (bgDelta !== 0) {
    window.santaApp.fire('sound-trigger', {
      name: 'sm_change_bg',
      args: [bg]
    });
  } else if (fgDelta !== 0) {
    window.santaApp.fire('sound-trigger', {
      name: 'sm_change_fg',
      args: [fg]
    });
  }
};
