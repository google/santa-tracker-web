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
  constructor(bpm) {
    this.lastUpdateTime = 0;
    this.bar = 0;
    this.beat = 0;
    this.queue = [];
    //this.beatDuration = 1000 / bpm * 60
    this._onBeat = this._onBeat.bind(this);
    this._startScheduled = false; 
    //this.update();
  }

  setLevel(lvl) {
    // lvl = 0-5
    var bpm = 120;
    if (lvl > 1) {
      bpm = 130;
    } else if (lvl > 3) {
      bpm = 140;
    }

    this.klangSeq._bpm = bpm;

    var playingLoop;
    for (var i = 0; i< this.tracks.length; i++) {
        if (this.tracks[i].playing) {   
            playingLoop = this.tracks[i];
            break;
        }
    }
    this.klangUtil.transition(playingLoop, this.tracks[lvl], bpm, 0, 2);

  }


  start() {
    this.klangSeq = this.klangSeq || Klang.$('codeboogie_sequencer');

    this.klangUtil = Klang.getUtil();

    this.tracks = Klang.$('codeboogie_tracks')._content;
    this.klangSeq.off('beforeNextBeat', this._onBeat );
    this.klangSeq.on('beforeNextBeat', this._onBeat );
    this.klangSeq.start();
    this._startScheduled = true;

    window.testo = this;
  }

  stop(){
    this.klangSeq.off('beforeNextBeat', this._onBeat );
    this.klangSeq.stop();
  }
  // update(timestamp) {
  //   let dt = timestamp - this.lastUpdateTime;

  //   if (dt > this.beatDuration) {
  //     this.lastUpdateTime = timestamp;

  //     this.beat += 1;

  //     if (this.beat % 4 === 0) {
  //       this.bar += 1;
  //       this.onBar(this.bar, this.beat);
  //     }

  //     this.onBeat(this.beat);
  //   }

  //   window.requestAnimationFrame(t => this.update(t));
  // }

  add(moves) {
    moves.forEach(move => this.queue.unshift(move));
  }

  _onBeat(currentBeat, timeToNextBeat, currentTime ) {
    //console.log(arguments)
    if ( this._startScheduled ){
      //Klang.triggerEvent('codeboogie_level_1', timeToNextBeat)
      //this.tracks[0].play();
      this.setLevel(4)
      this._startScheduled = false; 
    }
    if ( currentBeat % 4 == 0 ) this._onBar(Math.floor(currentBeat /4, timeToNextBeat))

    this.onBeat && setTimeout( this.onBeat.bind(this, currentBeat), timeToNextBeat * 1000 );
  }

  _onBar(bar, timeToNextBar ) {
    this.onBar && setTimeout( this.onBar.bind(this, bar), timeToNextBar * 1000 );
  }
}
