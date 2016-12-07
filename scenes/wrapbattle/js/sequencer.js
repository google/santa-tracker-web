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

app.Sequencer = class {
  constructor() {
    this.bar = 0;
    this.beat = -1;
    this._variant = 0;
    this._playScheduled = false;
    this._bpm = 120;

    if (Klang.engineVersion === 'audiotag') {
      this._fallback = true;
    }
  }

  setTrack(track) {
    this._nextTrack = track;
    this._playScheduled = true;
  }
  getVariants() {
    return this.tracks.length;
  }
  setVariant(variant) {

    this._variant = variant;
    this._playScheduled = true;
  }
  setMaxIntensity() {

    this._transitionToMega = true;
    window.santaApp.fire('sound-trigger', 'wrapbattle_megamode_start');
    window.santaApp.fire('sound-trigger', 'wrapbattle_megamode_transition_in');

  }
  setNormalIntensity( powerUpActive ) {
    this._transitionFromMega = true;
    window.santaApp.fire('sound-trigger', 'wrapbattle_megamode_end');
    if (powerUpActive) {
      window.santaApp.fire('sound-trigger', 'wrapbattle_megamode_transition_out');
    }
  }
  getPlayingLoops() {
    var playingLoops = [];
    if (!this.tracks) {
      return null;
    }
    for (var i = 0; i < this.tracks.length; i++) {
      if (this.tracks[i].playing && this.tracks[i].position >= 0) {
          playingLoops.push(this.tracks[i]);

      }
    }
    if (playingLoops.length === 0 && this.lastTracks) {
      for (var i = 0; i < this.lastTracks.length; i++) {
        if (this.lastTracks[i].playing && this.lastTracks[i].position >= 0) {
            playingLoops.push(this.lastTracks[i]);

        }
      }
    }
    return playingLoops;
  }
  pause() {
    this.pausePositions = [];
    if (this._fallback && this._currentTrack) {
      let pos = 0;
      let currTrack = Klang.$(this._currentTrack);
      if (currTrack && currTrack._content) {
        pos = currTrack._content[0].position;
        currTrack._content[0].stop();
      }
      this.pausePositions.push(pos);
    }else {
      var playingLoops = this.getPlayingLoops();
      if (playingLoops) {

        for (let i = 0; i<playingLoops.length; i++) {
          this.pausePositions.push(playingLoops[i].position);
        }

        if ( this.scheduledStopTime < Klang.Util.now() ) {
          this.scheduledStopTime = 0;
        }else {
          this.scheduledStopTime = this.scheduledStopTime - Klang.Util.now()
        }
        if (this.scheduledLoopTime < Klang.Util.now()) {
          this.scheduledLoopTime = 0;
        }else {
          this.scheduledLoopTime = this.scheduledLoopTime - Klang.Util.now();
        }
        this.pausedSounds = playingLoops;
        for (let i = 0; i<playingLoops.length; i++) {
          playingLoops[i].stop();
        }
      }else {
        if (this.tracks && this.tracks.length) {
          this.pausedSounds = this.tracks[0];
        }
        this.pausePositions = [0,0,0];
        this.scheduledStopTime = 0;
        this.scheduledLoopTime = 0;
      }


      if (this.scheduledLoops) {
        for (let i = 0; i < this.scheduledLoops.length; i++) {
          this.scheduledLoops[i].stop();
        }
      }
    }
  }
  resume() {
    if (this._fallback) {
      window.santaApp.fire('sound-trigger', {'name': 'fallback_' + this._nextTrack, 'args': [this.pausePositions[0]] });
    }else {
      if (this.pausedSounds) {
        for ( let i = 0; i < this.pausedSounds.length; i++ ) {
          this.pausedSounds[i].play( Klang.Util.now(), this.pausePositions[i] );
          if (this.scheduledStopTime > 0) {
            this.pausedSounds[i].stop( Klang.Util.now() + this.scheduledStopTime );
          }
        }
      }
      if (this.scheduledLoops && this.scheduledLoopTime > 0) {
        for (let i = 0; i < this.scheduledLoops.length; i++) {
          this.scheduledLoops[i].play( Klang.Util.now() + this.scheduledLoopTime );
        }
      }
    }
  }
  play( callback ) {
    if (!this._playScheduled) { return; }
    var delayTime = 0;
    var nextBpm;

    if (this._fallback) {

      if (this._currentTrack && (this._currentTrack !== this._nextTrack)) {
        let currTrack = Klang.$(this._currentTrack);
        if (currTrack && currTrack._content) {
          currTrack._content[0].fadeOutAndStop(0.2);
        }
      }

      let tempos = {
        'wrapbattle_track01': 80,
        'wrapbattle_track02': 87,
        'wrapbattle_track03': 110,
        'wrapbattle_track04': 140
      }
      this._currentTrack = this._nextTrack;
      nextBpm = tempos[this._currentTrack];
      window.santaApp.fire('sound-trigger', 'fallback_' + this._currentTrack);

    }else {
      //window.santaApp.fire('sound-trigger', 'cb_fallback_start');
      var playingLoops = this.getPlayingLoops();
      var currentBpm = this._bpm;


      if (this._nextTrack) {
        if (this.tracks) {
          this.lastTracks = this.tracks;
        }
        this.tracks = Klang.$(this._nextTrack)._content;
        nextBpm = Klang.$(this._nextTrack).data.metaData.bpm;
        if (playingLoops && playingLoops.length) {
          playTransition = true;

        }
      }

      let offset = 0;

      var scheduleTime = this.transition( playingLoops, this.tracks, currentBpm, 0, 0.2, offset);

      delayTime = scheduleTime - Klang.Util.now();

    }

    this._playScheduled = false;


    setTimeout(()=> {
      if (nextBpm) {
        this._bpm = nextBpm;
      }
      callback && callback();
    }, delayTime * 1000);
  }
  transition(from, to, bpm, sync, fadeOutTime, offset) {
    var bpm = bpm || 120;
    var fadeOutTime = fadeOutTime || 2;
    var from = from;
    var to = to;
    if (!to) {
      return Klang.Util.now();
    }
    if (from === to) {
      return Klang.Util.now();
    }

    if (!from) {
      for (let i = 0; i < to.length; i++) {
        to[i].play(Klang.Util.now(), 0, false);
      }
      return Klang.Util.now();
    }

    var scheduleTime = Klang.Util.now() + this.getTimeToNextBar(from, bpm);

    this.scheduledLoops = to;
    this.scheduledLoopTime = scheduleTime;
    let stopTime;

    stopTime = scheduleTime;
    for (let i = 0; i < from.length; i++) {
      from[i] && from[i].stop(Klang.Util.now());
    }

    this.scheduledStopTime = stopTime;

    for (let i = 0; i < to.length; i++) {
      to[i].play(scheduleTime, offset, false);
    }


    return scheduleTime;
  }
  getTimeToNextBar(from, bpm) {
    if (!from) {

      return 0;
    }
    var bps = 60 / bpm;
    var spb = bpm / 60;
    var p1 = from[0] ? from[0].position : 0;
    p1 = p1 || 0 //from.position sometimes returns NaN
    ;
    var beat1 = p1 * spb;
    var sync = sync || 4;
    var toNextBar = sync - (beat1 % sync);
    if (toNextBar < 0.5) {
      toNextBar += sync;
    }
    var toNextBarSec = toNextBar * bps;
    if (from[0] && !from[0].playing) {
      toNextBarSec = 0;
    }else if (!from.length) {
      toNextBarSec = 0;
    }
    return toNextBarSec;
  }
  onNextBar(callback) {
    let playingLoops = this.getPlayingLoops();
    var delayTime = this.getTimeToNextBar(playingLoops, this._bpm);

    if ((playingLoops && playingLoops.length) || this._fallback) {
      window.santaApp.fire('sound-trigger', {name: 'wrapbattle_next_level_transition', args: [delayTime]});
    }
    setTimeout(()=> {
      callback && callback();
    }, delayTime * 1000);
  }
  onGameOver() {
    this.stop();
  }
  stop() {
    let loops = this.getPlayingLoops();
    if (loops) {
      for (let i = 0; i<loops.length; i++) {
        loops[i].fadeOutAndStop(1);
      }
    }
  }

  getBPM(){
    return this._bpm;
  }

  update() {
    let currPos;
    if (Klang.engineVersion === 'webaudio') {
      let loop = this.getPlayingLoops();
      currPos = loop ? loop.position : 0;
    } else {
      currPos = +new Date / 1000;
    }
    let beat = Math.floor(currPos / (60 / this._bpm));

    if (this.beat !== beat) {
      this.beat = beat;
      //this.onBeat(this.beat, this._bpm, this._variant === 1);

      this.play();
    }

    //window.requestAnimationFrame(() => this.update());
  }
};
