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

goog.provide('app.Fallback');

/**
 * Fallback Audio object, where Web Audio is not supported.
 * @param {string} name of audio
 * @constructor
 */
app.Fallback = function(name) {
  this.klangEventName = 'jamband_fb_play_' + name.toLowerCase();
};

/**
 * Play a preview of the instrument
 */
app.Fallback.prototype.preview = function() {
  window.santaApp.fire('sound-trigger', this.klangEventName);
};

/**
 * Plays fallback audio.
 *
 * @param {number} pattern ignored
 * @param {number} volume ignored
 * @param {!Function} callback to invoke
 */
app.Fallback.prototype.play = function(pattern, volume, callback) {
  callback();
  app.Fallback.play();
};

/**
 * Does nothing, emulates app.Audio.
 */
app.Fallback.prototype.stop = function() {
};

/**
 * Whether any fallbacks are currently playing.
 * @type {boolean}
 */
app.Fallback.playing = false;

/**
 * Play the background fallback tune.
 */
app.Fallback.play = function() {
  if (!app.Fallback.playing) {
    // play the tune.
    window.santaApp.fire('sound-ambient', 'jamband_fb_loop_start');
  }
  app.Fallback.playing = true;
};

/**
 * Stop the background fallback tune.
 */
app.Fallback.stop = function() {
  window.santaApp.fire('sound-ambient', 'jamband_fb_loop_stop');
  app.Fallback.playing = false;
};
