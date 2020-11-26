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


import {_static} from './magic.js';
import {AudioLoader} from './kplay-lib.js';
import './polyfill/event-target.js';
import '../third_party/lib/klang/config.js';

const audioPath = _static`audio`;

const masterContext = new (window.AudioContext || window.webkitAudioContext)();

const Util = {
  now() {
    // nb. might be zero if suspended
    return masterContext.currentTime;
  },

  random(high, low = 1) {
    return ~~(low + (1 + high - low) * Math.random());
  },

  randomFloat(high, low = 1) {
    return low + (high - low) * Math.random();
  },

  /**
   * @param {!AudioParam} p
   * @param {number} value
   * @param {number} duration
   * @param {number} when
   */
  curveParamLin(p, value, duration, when, startAt) {
    // nb. startAt is totally ignored: we use the previous state only.
    const now = masterContext.currentTime;
    when = when || now;

    p.cancelScheduledValues(0);
    if (when + duration <= now) {
      p.value = value;
    } else {
      p.setValueAtTime(p.value, when);
      p.linearRampToValueAtTime(value, when + duration);
    }
  },

  /**
   * @param {!AudioParam} p
   * @param {number} value
   * @param {number} duration
   * @param {number} when
   */
  curveParamExp(p, value, duration, when, startAt) {
    // nb. startAt is totally ignored: we use the previous state only.
    const now = masterContext.currentTime;
    when = when || now;

    p.cancelScheduledValues(0);
    if (when + duration <= now) {
      p.value = value;
    } else {
      p.setValueAtTime(p.value, when);
      p.exponentialRampToValueAtTime(value, when + duration);
    }
  },

  transition(fromCandidates, to, bpm, sync, fadeOutTime, fadeInTime, useOffset, fadeOutImmediately, setOffset) {
    const now = masterContext.currentTime;

    if (fadeInTime || useOffset || fadeOutImmediately) {
      throw new TypeError('unsupported use of transition');
    }
    bpm = bpm || 120;
    fadeOutTime = fadeOutTime || 2;

    if (!to) {
      throw new Error('no transition to');
    }

    if (!Array.isArray(fromCandidates)) {
      if (!fromCandidates) {
        fromCandidates = [];
      } else {
        fromCandidates = [fromCandidates];
      }
    }

    let from = null;
    for (const candidate of fromCandidates) {
      if (candidate.playing) {
        from = candidate;  // pick any that's currently playing
        break;
      }
    }

    if (from === to && !from.stopping) {
      from.dispatchEvent(new Event('trigger'));  // mark for transitionTo
      return now;
    }
    if (!from) {
      to.play(now, 0);
      return now;
    }
    const beatsPerSecond = 60 / bpm;  // beats per second
    const secondsPerBeat = bpm / 60;  // seconds per beat
    const p1 = (from ? from.position : 0) || 0;  // .position might be NaN or invalid
    const beat1 = p1 * secondsPerBeat;
    sync = sync || 4;

    let toNextBar = sync - beat1 % sync;
    if (toNextBar < 0.5) {
      toNextBar += sync;
    }

    const toNextBarSec = from.playing ? toNextBar * beatsPerSecond : 0;
    const scheduleTime = now + toNextBarSec;

    to.play(scheduleTime);

    const toStop = fromCandidates.filter((c) => !c.stopping && c !== to);
    toStop.forEach((stop) => stop.fadeOutAndStop(fadeOutTime, scheduleTime));

    return scheduleTime;
  },
};


let activeController = null;
let preloadGroupCallback = null;

const Klang = {
  triggerEvent(name, ...args) {
    if (activeController) {
      activeController.play(name, ...args);
    }
  },
  load(groups) {
    if (preloadGroupCallback) {
      groups.forEach((group) => preloadGroupCallback(group));
    }
  },
  Util,
};
window.Klang = Klang;


class SimpleProcess extends EventTarget {
  constructor(config, nodes, globalVars) {
    super();

    this._nodes = nodes;
    this._globalVars = globalVars;
    this._timeout = 0;
    this._loop = Boolean(config['loop']);

    if (config['type'] === 'AdvancedProcess') {
      if (config['pre_action']['script'] !== 'me.process.stop();') {
        throw new TypeError('expected pre_action to be standard, was: ' + config['pre_action']['script']);
      };
      const [waitOp, execOp] = config['actions'];

      if (waitOp['operation'] !== 'wait' || execOp['operation'] !== 'exec') {
        throw new TypeError('invalid op order for AdvancedProcess');
      }

      this.delay = new Function('Util', waitOp['script']);
      this._fn = new Function('Core', 'Model', 'Util', 'me', 'args', 'vars', execOp['script']);
    } else {
      this._fn = config['action'];

      if (this._loop) {
        throw new Error('cannot loop SimpleProcess, no delay');
      }
    }

    this.delay = this.delay.bind(null, Util);
  }

  get _started() {
    // incorrectly referenced by config
    return this.started;
  }

  get started() {
    return Boolean(this._timeout);
  }

  delay() {
    return 0;
  }

  stop() {
    if (this._timeout) {
      window.clearTimeout(this._timeout);
      this._timeout = 0;
      this.dispatchEvent(new Event('ended'));
    }
  }

  start(args) {
    if (this._timeout) {
      // Every AdvancedProcess just stops itself on start, resetting the delay.
      window.clearTimeout(this._timeout);
    }

    const delay = this.delay();
    const run = () => {
      this._fn(/** Core */ null, /** Model */ null, Util, this._nodes, args, this._globalVars);

      if (this._timeout) {
        this._timeout = 0;
        if (this._loop) {
          this.start(args);  // start again if loop and a non-zero delay
        } else {
          // only 'started' if there was a timeout
          this.dispatchEvent(new Event('ended'));
        }
      }
    };
    if (delay > 0) {
      this.dispatchEvent(new Event('started'));
      this._timeout = window.setTimeout(run, delay * 1000);
    } else {
      // Instant run dispatches no events. It's not started or ended.
      run();
    }
  }
}


class EffectBiquadFilter {
  constructor(config) {
    this._filter = masterContext.createBiquadFilter();
    this._filter.type = config['filter_type'] || 'lowpass';

    this._originalFrequency = config['frequency'] || 1000;
    this._originalQ = config['q'] || 1.0;
    this._originalGain = config['gain'] || 0.0;

    this._filter.frequency.value = this._originalFrequency;
    this._filter.Q.value = this._originalQ;
    this._filter.gain.value = this._originalGain;
  }

  reset(duration=0.0) {
    // nb. Q and gain aren't modified by anyone
    Util.curveParamLin(this._filter.frequency, this._originalFrequency, duration);
  }

  get node() {
    return this._filter;
  }

  get frequency() {
    return this._filter.frequency;
  }
}


class EffectSteroPanner {
  // Note that EffectStereoPanner exposes pan as a number with linPanTo() helper, but
  // EffectBiquadFilter exposes individial AudioParam instances.

  constructor(config) {
    // does not use createStereoPanner, Safari doesn't support it
    this._panner = masterContext.createPanner();
    this._panner.panningModel = 'equalpower';

    this._originalPan = config['pan'] || 0.0;
    this.pan = this._originalPan;
  }

  linPanTo(value, duration) {
    // match 'set pan' but curve value
    Util.curveParamLin(this._panner.orientationX, value, duration);
    Util.curveParamLin(this._panner.orientationZ, 1 - Math.abs(value), duration);
  }

  reset(duration=0.0) {
    this.linPanTo(this._originalPan, duration);
  }

  get node() {
    return this._panner;
  }

  get pan() {
    return this._panner.orientationX.value;
  }

  set pan(value) {
    this._panner.setPosition(value, 0, 1 - Math.abs(value));
  }
}


class Sequencer {
  constructor(config) {
    this._bpm = config['bpm'];
    this._started = false;  // must match this, Klang config asks for it directly
  }

  start() {
    this._started = true;
  }

  stop() {
    this._started = false;
  }

  get started() {
    return this._started;
  }
}


class AudioBus {
  constructor(config, destination) {
    this._input = masterContext.createGain();
    this._output = masterContext.createGain();

    this._originalInputVolume = config['input_vol'] !== undefined ? config['input_vol'] : 1.0;
    this._originalOutputVolume = config['output_vol'] !== undefined ? config['output_vol'] : 1.0;
    // both mutable
    this._input.gain.value = this._originalInputVolume;
    this._output.gain.value = this._originalOutputVolume;

    this._effects = (config['effects'] || []).map((effect) => {
      switch (effect['type']) {
        case 'BiquadFilter':
          return new EffectBiquadFilter(effect);
        case 'StereoPanner':
          return new EffectSteroPanner(effect);
      }
      throw new TypeError(`unsupported effect: ${effect['type']}`);
    });

    let current = this._input;
    this._effects.forEach((effect) => {
      current.connect(effect.node);
      current = effect.node;
    });
    current.connect(this._output);

    if (destination === null) {
      this._output.connect(masterContext.destination);
    } else if (destination instanceof AudioBus) {
      this._output.connect(destination.input);
    } else {
      throw new Error('unknown AudioBus destination');
    }
  }

  /**
   * Reset this AudioBus.
   */
  reset(duration=0.0) {
    Util.curveParamLin(this._input.gain, this._originalInputVolume, duration);
    Util.curveParamLin(this._output.gain, this._originalOutputVolume, duration);
    this.effects.forEach((effect) => effect.reset(duration));
  }

  get effects() {
    return this._effects;
  }

  get input() {
    return this._input;
  }

  get output() {
    return this._output;
  }
}


class AudioGroup extends EventTarget {
  static get types() {
    return {
      CONCURRENT: 0,
      STEP: 1,
      RANDOM: 2,
      SHUFFLE: 3,
    };
  }

  constructor(config, nodes) {
    super();

    this._type = 'group_type' in config ? config['group_type'] : 2;
    this._active = null;

    if (config['retrig']) {
      throw new TypeError(`unsupported retrig AudioGroup`);
    }

    // _content is needed by config, incorrectly referenced vs 'content'
    this._content = config['content'].map((key) => nodes[key]);
    this._activeContent = new Set();

    this._onContentStarted = this._onContentStarted.bind(this);
    this._onContentEnded = this._onContentEnded.bind(this);
    this._content.forEach((c) => {
      c.addEventListener('started', this._onContentStarted);
      c.addEventListener('ended', this._onContentEnded);
    });
  }

  _onContentStarted(ev) {
    if (this._activeContent.size === 0) {
      this.dispatchEvent(new Event('started'));
    }
    this._activeContent.add(ev.target);
  }

  _onContentEnded(ev) {
    const deleted = this._activeContent.delete(ev.target);
    if (deleted && this._activeContent.size === 0) {
      this.dispatchEvent(new Event('ended'));
    }
  }

  get content() {
    return this._content;
  }

  get active() {
    if (this._active && this._active.playing) {
      return [this._active];
    } else if (!this._type && this._content[0] && this._content[0].playing) {
      return this._content.slice();
    }
    return [];
  }

  get latestPlayed() {
    if (this._active && this._active.playing) {
      return this._active;
    }
    return null;
  }

  get playing() {
    // Check either the active node (for serial) or the first (for concurrent).
    const check = this._active || this._content[0] || null;
    return check ? check.playing : false;
  }

  get stopping() {
    const check = this._active || this._content[0] || null;
    return check ? check.stopping : false;
  }

  set playbackRate(rate) {
    this._content.forEach((content) => content.playbackRate = rate);
  }

  get playbackRate() {
    const all = this._content.map((content) => content.playbackRate);
    const sum = all.reduce((a, b) => a + b, 0);
    return sum / (all.length || 1);
  }

  curvePlaybackRate(rate, duration, when = masterContext.currentTime) {
    this._content.forEach((content) => content.curvePlaybackRate(rate, duration, when));
  }

  /**
   * @param {function(AudioNode): void} callback
   * @param {boolean=} playLike whether this is a playing action and should advance
   * @param {number=} index an index to force
   */
  _each(callback, playLike=false, index=-1) {

    const c = this._content;

    if (!this._type) {
      // This is concurrent. Enact on all.
      c.forEach(callback);
      return true;
    }

    if (playLike) {
      // Optionally advance the played audio.
      do {
        if (index >= 0 && index < c.length) {
          break;  // explicit index requested
        }

        if (this._type == AudioGroup.types.RANDOM) {
          // Choose a new random audio, even the same sample.
          index = ~~(Math.random() * c.length);
          break;
        }

        // Otherwise, move to the next index.
        index = (c.indexOf(this._active) + 1) % c.length;
        if (index || this._type !== AudioGroup.types.SHUFFLE) {
          break;
        }

        // Unless this is the start of the SHUFFLE, in which case, reorder.
        c.sort(() => Math.random() - 0.5);
        if (this._active && c[0] === this._active) {
          // ... and don't let the same audio play twice in a row
          c.push(c.shift());
        }

      } while (false);

      this._active = c[index] || null;
    }

    if (this._active) {
      callback(this._active);
      return true;
    }
    return false;
  }

  play(when, index=-1) {
    if (typeof index !== 'number') {
      throw new TypeError('can only force play a specific index');
    }
    this.dispatchEvent(new Event('trigger'));
    const played = this._each((c) => c.play(when), true, index);
    if (!played) {
      this.active.forEach((c) => c.dispatchEvent(new Event('trigger')));
    }
  }

  stop() {
    this._each((c) => c.stop());
  }

  fadeInAndPlay(duration, when) {
    this.dispatchEvent(new Event('trigger'));
    const played = this._each((c) => c.fadeInAndPlay(duration, when), true);
    if (!played) {
      this.active.forEach((c) => c.dispatchEvent(new Event('trigger')));
    }
  }

  fadeOutAndStop(duration, when) {
    this._each((c) => c.fadeOutAndStop(duration, when), false);
  }
}


class AudioSource extends EventTarget {
  constructor(config, buffer, destination) {
    super();

    this._buffer = buffer;
    this._startTime = 0.0;         // startTime of last triggered sound
    this._performanceStart = 0.0;  // used if context is suspended, to restore loops

    // Every AudioSource has its own unique Gain, since we control its volume individually.
    this._output = masterContext.createGain();
    this._output.connect(destination.input);

    // Any currently pending fade callback.
    this._fadeOutTimeout = 0;
    this._fadeOutTime = 0.0;

    // If this is a retrig node, we could be playing it multiple times.
    this._sources = [];

    // Define _shiftSource, which returns a random value in the pitch-shift range on a per-source
    // basis, or consistently 1.0 for none. This doesn't predetermine it on created source nodes
    // *because* other code can modify the overall speed of an AudioSource.
    if (config['pitch_start_range'] && config['pitch_end_range']) {
      const low = config['pitch_start_range'];
      const high = config['pitch_end_range'];

      const shifts = new WeakMap();
      this._shiftSource = (source) => {
        const prev = shifts.get(source);
        if (prev !== undefined) {
          return prev;
        }
        const v = low + Math.random() * (high - low);
        shifts.set(source, v);
        return v;
      };
    }

    // Create _volumeNode, which wraps a passed node in a preconfigured gain node, iff random volume
    // config is specified.
    if (config['volume_start_range'] && config['volume_end_range']) {
      const low = config['volume_start_range'];
      const high = config['volume_end_range'];

      this._volumeNode = (node) => {
        const gain = masterContext.createGain();
        gain.gain.value = low + Math.random() * (high - low);
        node.connect(gain);
        return gain;
      };
    }

    this._originalPlaybackRate = config['playback_rate'] || 1.0;
    this._playbackRate = this._originalPlaybackRate;  // mutable

    this._config = config;
    this._volume = config['volume'] || 1.0;
    this._loop = Boolean(config['loop']);
    this._loopStart = this._config['loop_start'] || undefined;
    this._loopEnd = this._config['loop_end'] || undefined;
    this._retrig = config['retrig'] === undefined ? true : Boolean(config['retrig']);

    if (this._loop) {
      this._retrig = false;
    }
  }

  _volumeNode(node) {
    return node;
  }

  _shiftSource() {
    return 1.0;
  }

  _createSource() {
    const source = masterContext.createBufferSource();
    source.buffer = this._buffer;
    source.playbackRate.value = this._playbackRate * this._shiftSource(source);

    if (this._loop) {
      source.loop = true;

      if (this._loopStart !== undefined) {
        source.loopStart = this._loopStart;

        if (this._loopEnd === undefined && source.buffer) {
          source.loopEnd = source.buffer.duration;
        }
      }
      if (this._loopEnd !== undefined) {
        source.loopEnd = this._loopEnd;
      }
    }

    // This optionally wraps our source in something which adjusts volume randomly for this play.
    const actualNode = this._volumeNode(source);
    actualNode.connect(this._output);

    this._sources.unshift(source);
    source.addEventListener('ended', this._cleanup.bind(this, source), {once: true});
    return source;
  }

  _cleanup(source, ev) {
    // this should probably always be last
    const index = this._sources.lastIndexOf(source);
    if (index !== -1) {
      this._sources.splice(index, 1);
      if (this._sources.length === 0) {
        this.dispatchEvent(new Event('ended'));
      }
    }
  }

  _resetFade() {
    const g = this._output.gain;
    g.cancelScheduledValues(0);
    g.setValueAtTime(this._volume, 0);
    window.clearTimeout(this._fadeOutTimeout);
    this._fadeOutTimeout = 0;
    this._fadeOutTime = 0.0;
  }

  _internalPlay(when, offset=0) {
    const lastSource = this._sources[0] || null;
    const anyPlaying = Boolean(lastSource);

    if (anyPlaying && (!this._retrig || this._loop)) {
      this.dispatchEvent(new Event('trigger'));
      return false;  // nothing to do: was already playing
    } else if (!this._loop && !this._buffer) {
      return false;  // if there's no buffer, don't "play" once-off sounds
    }

    this.dispatchEvent(new Event('trigger'));
    if (!anyPlaying) {
      this.dispatchEvent(new Event('started'));
    }

    const source = this._createSource();
    source.start(when, offset);
    this._startTime = Math.max(this._startTime, when);
    this._startOffset = offset; //TODO: also count with the AudioSources initial offset

    // If this is looping audio but the context is suspended (due to lack of user gesture), record
    // when it was really intended to be started.
    if (this._loop && masterContext.state === 'suspended') {
      this._performanceStart = performance.now() / 1000.0;  // in sec
    }

    return true;
  }

  _internalSetPlaybackRate(rate) {
    if (rate === this._playbackRate) {
      return false;
    } else if (rate !== this._originalPlaybackRate) {
      this.dispatchEvent(new Event('dirty'));
    }
    this._playbackRate = rate;  // set for future sources
    return true;
  }

  get position() {
    const source = this._sources[0] || null;
    if (source === null || !this._buffer) {
      return 0;
    }
    const now = masterContext.currentTime;

    let duration = this._buffer.duration;
    if (source.loop && (source.loopStart || source.loopEnd)) {
      // Optionally correct for loopStart/loopEnd.
      // TODO(samthor): This isn't quite right. Audio plays from zero, to loopEnd, to loopStart, ...
      duration = (source.loopEnd || duration) - (source.loopStart || 0);
    }
    return this._startOffset + (now - this._startTime) % duration;
  }

  get loop() {
    return this._loop;
  }

  /**
   * Invoked after AudioContext is resumed from a suspended state, i.e., because the user has
   * unmuted the browser. Ensures loops are playing at their correct time.
   *
   * @param {number} now in seconds
   */
  resume(now) {
    if (this._loop && this._sources.length && this._performanceStart) {
      const delta = now - this._performanceStart;
      this._performanceStart = 0.0;

      // masterContext.currentTime was very recently stuck at zero because it was suspended. Set a
      // fake startTime on this AudioSource so it is tricked into calculating the current intended
      // position, then restart the underlying source.
      this._startTime = masterContext.currentTime - delta;
      const position = this.position;  // calculate trick position
      this._sources.forEach((source) => {
        // safari invalidState fix
        if ( source.playbackState == undefined || source.playbackState > 0 ) {
          source.stop();
        }
      });

      const source = this._createSource();
      source.start(masterContext.currentTime, position);
    }
  }

  set buffer(buffer) {
    if (buffer === this._buffer) {
      return;
    }

    // TODO(samthor): This probably doesn't reset the correct starting time on looped audio, e.g.,
    // as it is done in resume() above.
    this._startTime = masterContext.currentTime;  // reset as playing will reset
    this._buffer = buffer;

    this._sources.forEach((source) => {
      source.buffer = buffer;
    });
  }

  get buffer() {
    return this._buffer;
  }

  get duration () {
    return this._buffer ? this._buffer.duration : 0;
  }

  /**
   * @return {!GainNode}
   */
  get output() {
    // This is a bit gross, but the only reason config accesses the output node of an AudioSource
    // is to tweak its gain. Ensure that it is reset next time.
    this.dispatchEvent(new Event('dirty'));
    return this._output;
  }

  get playing() {
    // nb. This is less good than the previous version.
    return Boolean(this._sources.length);
  }

  set playbackRate(rate) {
    if (this._internalSetPlaybackRate(rate) && this._loop && this._sources[0]) {
      // only adjust on looping sounds, leave playing instant alone
      const source = this._sources[0];
      const p = source.playbackRate;
      p.cancelScheduledValues(0);
      p.value = rate * this._shiftSource(source);
    }
  }

  get playbackRate() {
    return this._playbackRate;
  }

  get playbackRateNode() {
    return this._sources[0] ? this._sources[0].playbackRate : null;
  }

  curvePlaybackRate(rate, duration, when = masterContext.currentTime) {
    if (this._internalSetPlaybackRate(rate) && this._loop && this._sources[0]) {
      // only adjust on looping sounds, leave playing instant alone
      const source = this._sources[0];
      Util.curveParamExp(source.playbackRate, rate * this._shiftSource(source), duration, when);
    }
  }

  play(when, offset=0) {
    this._resetFade();  // clear fade in/out
    this._internalPlay(when || masterContext.currentTime, offset);
  }

  stop() {
    this._resetFade();  // clear fade in/out
    if (this._loop) {
      this._startTime = 0.0;
      this._performanceStart = 0.0;
    }

    // In retrig, only stops last source (multiple calls will eventually stop all).
    const sourceToStop = this._sources.shift() || null;
    if (sourceToStop === null) {
      return false;
    }
    if ( sourceToStop.playbackState == undefined || sourceToStop.playbackState > 0 ) {
      sourceToStop.stop();
    }
    this.dispatchEvent(new Event('ended'));
    // nb. 'when' wasn't used in the upstream code, and added tons of complexity.
  }

  fadeInAndPlay(duration, when, offset=0) {
    when = when || masterContext.currentTime;

    // Just play the sound, we're already live. This could include joining an existing 'fade in'
    // session.
    if (this._sources.length && !this._fadeOutTimeout) {
      return this._internalPlay(when, offset);
    }

    const g = this._output.gain;

    // Cancel any fadeOut and resume from where we were (or zero).
    const wasFading = (this._fadeOutTimeout !== 0);
    if (wasFading) {
      window.clearTimeout(this._fadeOutTimeout);
      this._fadeOutTimeout = 0;
      this._fadeOutTime = 0.0;
    } else {
      g.value = 0.0;  // fade from zero, unclear on node state
    }

    Util.curveParamLin(g, this._volume, duration, when);
    return this._internalPlay(when, offset);
  }

  fadeOutAndStop(duration, when) {
    const now = masterContext.currentTime;
    when = when || now;

    if (when <= now && duration <= 0.0) {
      return this.stop();  // implicitly clears fade
    }

    if (this._fadeOutTime && this._fadeOutTime < when) {
      return true;  // do nothing, already fading before request
    }

    Util.curveParamLin(this._output.gain, 0, duration, when);

    const after = (when + duration - now) * 1000;
    this._fadeOutTimeout = window.setTimeout(() => this.stop(), after);
    this._fadeOutTime = when;
  }

  get stopping() {
    return Boolean(this._fadeOutTimeout);
  }

  reset(duration=0.0) {
    const wasFading = (this._fadeOutTimeout !== 0);
    if (!wasFading) {
      this._resetFade();  // the output's gain might be wrong, reset it
    }
    this.curvePlaybackRate(this._originalPlaybackRate, duration);
  }
}


export function prepare() {
  const config = window['KLANG_CONFIG'];
  const globalVars = config['vars'];

  // Audio files aren't keyed, they just have an ID field.
  const rawFiles = {};
  config['files'].forEach((all) => rawFiles[all['id']] = all);

  const preload = {};
  const audioConfig = config['audio'];

  for (const key in audioConfig) {
    const def = audioConfig[key];

    if (def['type'] !== 'AudioSource') {
      continue;  // don't need to preload anything but AudioSource
    }

    // Note that in rare occasions, the same audio definition can point to the same file (e.g.,
    // with a different playback rate).
    const file = rawFiles[def['file_id']];
    const loadGroup = file['load_group'];
    let m = preload[loadGroup];
    if (m === undefined) {
      m = preload[loadGroup] = new Map();
    }
    m.set(key, file['url']);
  }

  Object.assign(audioConfig, config['busses'], config['sequencers'], config['processes']);

  // By default, our master output is muted.
  let masterOutMuted = true;
  const masterOut = new AudioBus({}, null);
  masterOut.output.gain.value = 0;

  const nodes = {
    '$OUT': masterOut,
  };

  const loaderCallback = (key, buffer) => {
    const existing = nodes[key];
    if (existing) {
      existing.buffer = buffer;
    }
  };
  const loader = new AudioLoader(masterContext, audioPath, loaderCallback);

  const busNodes = new Set();
  const activeNodes = new Set();
  const dirtyNodes = new Set();
  const transientAudioElements = new Set();
  let triggerNodes = null;

  /**
   * Build a K-node in the audio graph.
   *
   * @param {string} key
   * @param {!Object<string, *>} config
   */
  const prepareKNode = (key, config) => {
    const destination = nodes[config['destination_name']] || null;
    if ('destination_name' in config && !destination) {
      throw new Error(`got unprepared destination node ${config['destination_name']} for ${key}`);
    }
    let node;

    switch (config['type']) {
      case 'AudioSource':
        node = new AudioSource(config, loader.get(key), destination);
        node.addEventListener('dirty', (ev) => dirtyNodes.add(node));
        break;

      case 'AudioGroup':
        node = new AudioGroup(config, nodes);
        break;

      case 'AdvancedProcess':
      case 'SimpleProcess':
        node = new SimpleProcess(config, nodes, globalVars);
        break;

      case 'Bus':
        node = new AudioBus(config, destination);
        break;

      case 'Sequencer':
        node = new Sequencer(config);
        break;

      default:
        throw new Error('unsupported: ' + config['type']);
    }

    if (node instanceof EventTarget) {
      node.addEventListener('started', (ev) => activeNodes.add(node));
      node.addEventListener('ended', (ev) => activeNodes.delete(node));
      node.addEventListener('trigger', (ev) => {
        triggerNodes && triggerNodes.add(node);
      });
    }

    return node;
  };

  /**
   * Ensures that the requested key has its and all required K-nodes in the audio graph. This works
   * recursively: there's probably a better way.
   *
   * @param {string} key
   * @return {!Object}
   */
  const internalPrepareKey = (key) => {
    if (key in nodes) {
      return nodes[key];  // nothing to do
    }
    nodes[key] = null;  // prevent circular refs

    const c = audioConfig[key];

    const deps = [].concat(
      c['vars'] || [],
      c['content'] || [],
      c['destination_name'] || [],
    ).filter((x) => !(x in nodes));
    deps.forEach(internalPrepareKey);

    const node = prepareKNode(key, c, nodes);
    if (node instanceof AudioBus) {
      busNodes.add(node);
    }
    nodes[key] = node;
    return node;
  };

  // If the AudioContext starts 'suspended', ensure that looped audio is resumed at the correct
  // position when its state changes to 'running'.
  if (masterContext.state === 'suspended') {
    masterContext.onstatechange = (ev) => {
      if (masterContext.state !== 'running') {
        return;  // ignore
      }
      masterContext.onstatechange = null;  // clear for next

      const now = performance.now() / 1000.0;
      activeNodes.forEach((node) => {
        if (node instanceof AudioSource) {
          node.resume(now);
        }
      });
    };
  }

  return {
    transitionTo(events, duration=0.5) {
      if (typeof events === 'string') {
        events = [events];
      }

      // This records all played nodes caused as result of this event trigger.
      triggerNodes = new Set();
      events.forEach((event) => this.play(event));

      activeNodes.forEach((node) => {
        if (!node.stopping && !triggerNodes.has(node)) {
          if (node instanceof SimpleProcess) {
            node.stop();
          } else {
            node.fadeOutAndStop(duration);
          }
        }
      });

      triggerNodes = null;
      transientAudioElements.forEach((node) => node.pause());
      transientAudioElements.clear();
    },

    stopAll(duration=0.5) {
      triggerNodes = new Set();
      activeNodes.forEach((node) => {
        if (!node.stopping && !triggerNodes.has(node)) {
          if (node instanceof SimpleProcess) {
            node.stop();
          } else {
            node.fadeOutAndStop(duration);
          }
        }
      });

      transientAudioElements.forEach((node) => node.pause());
      transientAudioElements.clear();
    },

    reset(duration=0.5) {
      // If we pass a duration, dirtyNodes is actually cleared before these nodes are made entirely
      // clean again, but there's an implicit promise that they will resolve.
      dirtyNodes.forEach((node) => node.reset(duration));
      busNodes.forEach((node) => node.reset(duration));  // not storing these but there's only O(1)
      dirtyNodes.clear();
    },

    active() {
      return Array.from(activeNodes);
    },

    get suspended() {
      return masterContext.state === 'suspended';
    },

    get muted() {
      return masterOutMuted;
    },

    set muted(v) {
      if (v === masterOutMuted) {
        return;
      }
      masterOutMuted = v;
      Util.curveParamLin(masterOut.output.gain, masterOutMuted ? 0 : 1, 0.5);
    },

    resume() {
      return masterContext.resume();
    },

    preload(groups, callback) {
      if (typeof groups === 'string') {
        groups = [groups];
      }

      const promises = new Set();
      const processes = [];

      let done = 0;
      let total = 0;
      const invididualDone = callback ? () => callback(++done, total) : null;

      const work = (group) => {
        if (!(group in preload)) {
          return;  // bad group
        }
        preload[group].forEach((file, key) => {
          const p = loader.optionalPreload(key, file);
          if (p) {
            ++total;
            promises.add(p);
            p.then(invididualDone);
          }
        });
      };

      groups.forEach((group) => {
        const key = config['events'][group];
        const process = audioConfig[key];
        if (process && process['type'] === 'SimpleProcess') {
          // TODO: This is a bit ugly, but tries to steal processes that are probably triggering
          // a preload (they might also do other things, which we should prevent). Some require
          // vars because some preloads have side-effects.
          processes.push(process['action']);
        }
        work(group);
      });

      try {
        preloadGroupCallback = work;
        processes.forEach((f) => {
          try {
            f(null, null, null, null, [], null);
          } catch (e) {
            // ignore, probably trying to call vars
          }
        });
      } finally {
        preloadGroupCallback = null;
      }

      if (callback) {
        callback(0, total);
      }

      return Promise.all(Array.from(promises)).then(() => null);
    },

    play(event, ...args) {
      if (event === '@') {
        // Play transient audio from any HTTP URL if queued up with '@'. Used for translations.
        if (args.length !== 1) {
          throw new Error('expected URL arg for @ command');
        }
        const audio = new Audio(args[0]);
        audio.play();
        transientAudioElements.add(audio);
        audio.addEventListener('ended', () => transientAudioElements.delete(audio));
        return true;
      }

      // get internal name from friendly
      const entrypoint = config['events'][event] || config['exportedSymbols'][event];
      const e = entrypoint ? internalPrepareKey(entrypoint) : null;

      if (e instanceof AudioSource || e instanceof AudioGroup) {
        // Just play the simple audio. This could be a loop.
        return e.play();
      } else if (e instanceof SimpleProcess) {
        // Run the process.
        try {
          activeController = this;
          return e.start(args);
        } finally {
          activeController = null;
        }
      }

      if (typeof event === 'string') {
        console.debug('audio missing', event);
        ga('send', 'event', 'site', 'audio-failure', event)
        return false;
      }
      console.warn('got invalid arg for kplay lookup', event);
      throw new Error(`invalid type for kplay`);
    },

  };
}

