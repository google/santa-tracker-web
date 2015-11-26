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

'use strict'

goog.provide('app.Sequencer');

/*ß
 * Temporary mock for Klang sequencer.
 */
app.Sequencer = class {
  constructor() {
    this.lastUpdateTime = 0;
    this.bar = 0;
    this.beat = 0;
    this.queue = [];
    this._onBeat = this._onBeat.bind(this);
    this._levelScheduled = false;
    this._track = 0;
  }

  setLevel(level, bpm) {
    this._level = level;
    this._bpm = bpm;
    this._levelScheduled = true;
  }

  setTrack(track) {
    if (this._track !== track) {
      this._track = track;
      this._changeLevel();
    }
  }

  start() {
    this.klangSeq = this.klangSeq || Klang.$('codeboogie_sequencer');

    this.klangUtil = Klang.getUtil();

    this.tracks = Klang.$('codeboogie_tracks')._content;
    this.klangSeq.off('beforeNextBeat', this._onBeat );
    this.klangSeq.on('beforeNextBeat', this._onBeat );
    this.klangSeq.start();
  }

  stop(){
    this.klangSeq.off('beforeNextBeat', this._onBeat );
    this.klangSeq.stop();
  }

  _onBeat(currentBeat, timeToNextBeat, currentTime) {
    if (this._levelScheduled) {
      this._changeLevel();
    }

    this.onBeat && setTimeout(this.onBeat.bind(this, currentBeat), timeToNextBeat * 1000);
  }

  _changeLevel() {
    this.klangSeq._bpm = this._bpm;

    var playingLoop;

    for (var i = 0; i< this.tracks.length; i++) {
      if (this.tracks[i].playing) {
        playingLoop = this.tracks[i];
        break;
      }
    }

    // Each level has two tracks
    let track = this._level * 2;

    this.klangUtil.transition(playingLoop, this.tracks[track + this._track], this._bpm, 0, 2);
    this._levelScheduled = false;
  }
}
