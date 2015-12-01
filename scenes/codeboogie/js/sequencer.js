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

'use strict';

goog.provide('app.Sequencer');

/**
 * Temporary mock for Klang sequencer.
 */
app.Sequencer = class {
  constructor() {
    this.bar = 0;
    this.beat = -1;
    this._track = null;
    this._variant = 0;
    this.playingLoopId = null;
    this._playScheduled = false;
  }

  setTrack(track, bpm) {
    this._track = track;
    this._bpm = bpm;
    this._playScheduled = true;
  }

  setVariant(variant) {
    this._variant = variant;
    this._playScheduled = true;
  }

  getPlayingLoop() {
    var playingLoop;
    for (var i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].playing && this.tracks[i].position >= 0) {
        if (!playingLoop || this.tracks[i].position < playingLoop.position) {
          playingLoop = this.tracks[i];
          this.playingLoopId = i;
        }
      }
    }
    return playingLoop;
  }

  start() {
    this.klangUtil = Klang.getUtil();
    this.tracks = Klang.version == "webaudio" ? Klang.$('codeboogie_tracks')._content: [];

    this.update(0);
    this.play();
  }

  play() {
    if (!this._playScheduled) return;

    Klang.triggerEvent('cb_fallback_start');
    this.klangUtil.transition(this.getPlayingLoop(), this.tracks[this._track * 2 + this._variant], this._bpm, 0, 2);

    this._playScheduled = false;
  }

  stop(){
    this.getPlayingLoop().fadeOutAndStop(1);
  }

  update(timestamp) {
    let loop = this.getPlayingLoop();
    let currPos;
    if (Klang.version == "webaudio") {
      currPos = loop ? this.getPlayingLoop().position : 0;
    }else {
      currPos = new Date().getTime()/1000;
    }
    let beat = Math.floor(currPos / (60 / this._bpm));

    if (this.beat !== beat) {
      this.beat = beat;
      this.onBeat(this.beat, this._bpm);

      this.play();
    }

    window.requestAnimationFrame(t => this.update(t));
  }
};
