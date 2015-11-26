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

/**
 * Plays dance loops and calculates beat and bar
 */
app.Sequencer = class {
  constructor(bpm) {
    this.bar = 0;
    this.beat = -1;
    this.queue = [];
    this.bpmForTrack = [120,120,130,130,140,140];
    this.playingLoopId;
    this.trackToPlay;
    this.inited = false;
  }
  setTrack(track) {
    this.trackToPlay = track;
    if (this.inited) {
      this.setLevel(this.trackToPlay);
    }
  }
  setLevel(lvl) {

    // lvl = 0-5
    var bpm = 120;
    if (lvl <= 1) {
      bpm = 120;
    } else if (lvl <= 3) {
      bpm = 130;
    }else if (lvl <= 5) {
      bpm = 140;
    }
    this.klangUtil.transition(this.getPlayingLoop(), this.tracks[lvl], this._tempo, 0, 0.2);
    this._tempo = bpm;
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
    this.tracks = Klang.$('codeboogie_tracks')._content;
    this.inited = true;
    this.setLevel(this.trackToPlay);
    this.update();
    window.testo = this;
  }


  stop(){
    this.getPlayingLoop().fadeOutAndStop(1);
  }

  update(timestamp) {
    var loop = this.getPlayingLoop();
    var currPos = loop ? this.getPlayingLoop().position : 0;
    var beat = Math.floor( currPos / (60/this.bpmForTrack[this.playingLoopId]) ) % 4;
    if ( this.beat !== beat ){
      this.beat = beat;
      this.onBeat(this.beat);
      if (this.beat  === 0) {
        this.bar += 1;
        this.onBar(this.bar, this.beat);
      }
    }
    window.requestAnimationFrame(t => this.update(t));
  }

  add(moves) {
    moves.forEach(move => this.queue.unshift(move));
  }
}
