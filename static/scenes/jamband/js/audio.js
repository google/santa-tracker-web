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

goog.provide('app.Audio');

/**
 * @constructor
 * @param {number} index in Klang
 * @param {string} name of audio
 * @param {number} beat of audio
 */
app.Audio = function(index, name, beat) {
  this.index = index;
  this.name = name;
  this.beat = beat;  // TODO: not actually used anymore.

  this.timeout = 0;

  this._bpm = 120;  // all 120
  this.beatSync16th = 4; //start on next bar

  this.beatduration = 60 / this._bpm;
  this.beatsPerSecond = 1 / this.beatduration;
};

/**
 * Play the provided pattern. The callback is called when the pattern starts playing.
 *
 * @param {number} pattern number, either 0 or 1
 * @param {number} volume gain, in range [0,1]
 * @param {function()} callback to invoke once audio is done
 */
app.Audio.prototype.play = function(pattern, volume, callback) {
  if (!(pattern === 0 || pattern === 1)) {
    throw new TypeError(`expected pattern 0 or 1`);
  }

  window.clearTimeout(this.timeout);

  const currSeconds = performance.now() / 1000;

  // Play on the next ~4th or ~8th beat.
  const beat = Math.max(0, Math.floor(currSeconds / (60 / this._bpm)));
  const targetBeat = (~~(beat / this.beatSync16th) + 1) * this.beatSync16th;

  const targetSeconds = targetBeat * this.beatduration;

  this.timeout = window.setTimeout(() => {
    // yes, setTimeout is slightly variable, but it's pretty good: ~2-3ms past our target usually.
    window.santaApp.fire('sound-trigger', 'jamband_play_track', this.index, pattern, volume);
    callback && callback();
  }, (targetSeconds - currSeconds) * 1000);
};

/**
 * Stop the currently playing audio immediately.
 */
app.Audio.prototype.stop = function() {
  window.clearTimeout(this.timeout);
  window.santaApp.fire('sound-trigger', 'jamband_play_track', this.index, -1, 1.0);
};

/**
 * Play a preview of the instrument
 */
app.Audio.prototype.preview = function() {
  window.santaApp.fire('sound-trigger', {
    name: 'preview_instrument',
    args: [this.name.toLowerCase()],
  });
};

