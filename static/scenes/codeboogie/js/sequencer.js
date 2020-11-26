/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('app.Sequencer');

app.Sequencer = class {
  constructor(callback) {
    this._active = false;
    this._variant = 0;
    this._bpm = 0;
    this._playScheduled = -1;
    this._callback = callback;

    this._playAt = 0.0;

    this._beat = -1;

    this._update = this._update.bind(this);
  }

  setTrack(track, bpm) {
    this._track = track;
    this._bpm = bpm;
    this._variant = 0;
    this._play();
  }

  setVariant(variant) {
    // setVariant is called the frame _before_ the sound should play, so we can always just play at
    // the 0-th index of the next frame. This is really a proxy for "play another track".
    this._variant = variant;
    const frame = Math.floor(this._beat / 4);
    this._playScheduled = (frame + 1) * 4;  // next frame
  }

  _play() {
    this._playScheduled = -1;
    this._playAt = performance.now();
    window.santaApp.fire('sound-trigger', 'codeboogie_play_track', this._track * 2 + this._variant);
  }

  start() {
    if (this._active) {
      return;
    }
    this._active = true;  // prevent double rAF
    this._update();
  }

  _update() {
    window.requestAnimationFrame(this._update);

    // This used to be run by "sequencer" code inside Klang, but it's been moved to exist entirely
    // within this frame. The main goal is to keep track of beats and only trigger animations or
    // actions on the right beat. We just record `_playAt` and determine the beat from that.

    const currPos = (performance.now() - this._playAt) / 1000;
    let beat = Math.max(0, Math.floor(currPos / (60 / this._bpm)));
    if (isNaN(beat)) {
      beat = -1;
    }

    if (this._playScheduled >= 0 && this._playScheduled <= beat) {
      this._play();
      beat = 0;  // must reset beat to zero, we just started playing
    } else if (this._beat === beat) {
      return;  // not playing, and no beat change, abandon
    }

    this._beat = beat;
    this._callback(this._beat, this._bpm);
  }

}