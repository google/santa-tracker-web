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
 * @param {string} name of audio
 * @param {number} beat of audio
 */
app.Audio = function(name, beat) {
  this.name = name;
  this.beat = beat;
  this.audiosources = Klang.$(name);

  this.beatSync16th = 4;
  this.beatduration = 60 / Klang.$('jamband_sequencer')._bpm;
  this.beatsPerSecond = 1 / this.beatduration;
};

/**
 * Play the provided pattern. The callback is called when the pattern starts
 * playing.
 *
 * @param {number} pattern number, either 0 or 1
 * @param {number} volume gain, in range [0,1]
 * @param {function()} callback to invoke once audio is done
 */
app.Audio.prototype.play = function(pattern, volume, callback) {
  if (!(pattern === 0 || pattern === 1)) {
    console.warn('There are only two patterns. You should pass 0 or 1');
    pattern = 0;
  }

  var audiosource = this.audiosources.content[pattern];
  audiosource.loop = true;
  audiosource.output.gain.value = volume;

  if (this.currentAudiosource !== audiosource) {
    this.playNext(audiosource, callback);

    if (this.currentAudiosource) {
      this.stopNext(this.currentAudiosource);
    }

    this.currentAudiosource = audiosource;
    this.isPlaying = true;
  }
};

/**
 * Stop the currently playing audio
 */
app.Audio.prototype.stop = function() {
  if (this.currentAudiosource) {
    var when = 0;
    this.currentAudiosource.fadeOutAndStop(0.5, when);
    this.isPlaying = false;
    this.currentAudiosource = null;
  }
};

/**
 * Start playing the provided audiosource at the start of the next bar
 *
 * @param {!AudioSource} audiosource to play
 * @param {function()} callback to run then
 */
app.Audio.prototype.playNext = function(audiosource, callback) {
  var when = Klang.$('jamband_sequencer').getBeatTime(this.beatSync16th);
  var deltaWhen = when - Klang.context.currentTime;
  var beat = Math.floor(Klang.$('jamband_sequencer').currentStep);
  var scheduleBeat = (beat + Math.floor(deltaWhen * this.beatsPerSecond)) % this.beat;
  var offset = scheduleBeat * this.beatduration;

  audiosource.play(when, offset);
  Klang.schedule(when, callback);
};

/**
 * Stop the provided audiosource at the start of the next bar
 * @param {!AudioSource} audiosource to stop
 */
app.Audio.prototype.stopNext = function(audiosource) {
  var when = Klang.$('jamband_sequencer').getBeatTime(this.beatSync16th);
  audiosource.fadeOutAndStop(0.5, when);
};

/**
 * Play a preview of the instrument
 */
app.Audio.prototype.preview = function() {
  window.santaApp.fire('sound-trigger', {
    name: 'preview_instrument',
    args: [this.name.toLowerCase()]
  });
};

/**
 * @return {boolean} whether Web Audio is supported
 */
app.Audio.isSupported = function() {
 return !!(window.webkitAudioContext || window.AudioContext);
};
