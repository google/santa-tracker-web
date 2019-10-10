/*
 * Copyright 2016 Google Inc. All rights reserved.
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

'use strict';

goog.provide('app.Sequencer');

const TRACK_TEMPO = [80, 87, 110, 140];

app.Sequencer = class {
  constructor() {
    this._bpm = 120;
    this._playAt = 0;
    this._playTimeout = 0;

    // reset
    window.santaApp.fire('sound-trigger', 'wrapbattle_set_playback_rate', 1);
  }

  playTrack(track, callback) {
    const nextBpm = TRACK_TEMPO[track];
    if (nextBpm === undefined) {
      throw new Error(`unknown BPM for ${track}`)
    }

    const delayTime = this.getTimeToNextBar();
    this._playTimeout = window.setTimeout(() => {
      // TODO(samthor): Sometimes we hear a record scratching sound. Is this an invalid track or
      // leftover sound from startup?
      window.santaApp.fire('sound-trigger', 'wrapbattle_play_track', track);
      this._playAt = performance.now();
      this._bpm = nextBpm;
      callback();
    }, delayTime * 1000);
  }

  setMaxIntensity() {
    window.santaApp.fire('sound-trigger', 'wrapbattle_megamode_start');
    window.santaApp.fire('sound-trigger', 'wrapbattle_megamode_transition_in');
  }

  setNormalIntensity(powerUpActive) {
    window.santaApp.fire('sound-trigger', 'wrapbattle_megamode_end');
    if (powerUpActive) {
      window.santaApp.fire('sound-trigger', 'wrapbattle_megamode_transition_out');
    }
  }

  pause() {
    window.santaApp.fire('sound-trigger', 'wrapbattle_set_playback_rate', 0);
  }

  resume() {
    window.santaApp.fire('sound-trigger', 'wrapbattle_set_playback_rate', 1);
  }

  getTimeToNextBar(sync=4) {
    if (!this._playAt) {
      return 0;
    }

    const bpm = this._bpm;
    const bps = 60 / bpm;
    const spb = bpm / 60;
    const p1 = performance.now() - this._playAt;

    const beat1 = p1 * spb;
    let toNextBar = sync - (beat1 % sync);
    if (toNextBar < 0.5) {
      toNextBar += sync;
    }

    const toNextBarSec = toNextBar * bps;
    return toNextBarSec;
  }


  onNextBar(callback) {
    const delayTime = this.getTimeToNextBar();
    if (delayTime && this._playAt) {
      // onNextBar is only called when a new level is being played.
      window.santaApp.fire('sound-trigger', {name: 'wrapbattle_next_level_transition', args: [delayTime]});
    }
    window.setTimeout(callback, delayTime * 1000);
  }

  stop() {
    window.clearTimeout(this._playTimeout);
    this._playAt = 0;
    window.santaApp.fire('sound-trigger', 'wrapbattle_play_track', -1);  // play no track
  }

  /**
   * Return the current track's BPM, used by the animation player and game.
   */
  getBPM() {
    return this._bpm;
  }
};
