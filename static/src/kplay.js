
import {_static} from './magic.js';
import {AudioLoader} from './kplay-lib.js';
import './polyfill/event-target.js';

const configPath = _static`third_party/lib/klang/config.js`;
const audioPath = _static`audio`;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const masterContext = new AudioContext();



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
};
window.Klang = Klang;


const Util = {
  now() {
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
    if (startAt) {
      throw new Error('unhandled startAt: ' + startAt);
    }
    when = when || masterContext.currentTime;
    p.cancelScheduledValues(0);
    p.setValueAtTime(p.value, when);
    p.linearRampToValueAtTime(value, when + duration);
  },

  /**
   * @param {!AudioParam} p
   * @param {number} value
   * @param {number} duration
   * @param {number} when
   */
  curveParamExp(p, value, duration, when) {
    when = when || masterContext.currentTime;
    p.cancelScheduledValues(0);
    p.setValueAtTime(p.value, when);
    p.exponentialRampToValueAtTime(value, when + duration);
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

    to.play(scheduleTime, setOffset || 0);

    const toStop = fromCandidates.filter((c) => !c.stopping && c !== to);
    toStop.forEach((stop) => stop.fadeOutAndStop(fadeOutTime, scheduleTime));

    return scheduleTime;
  },
};



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
    console.debug('delaying', delay);
    const run = () => {
      this._fn(/** Core */ null, /** Model */ null, Util, this._nodes, args, this._globalVars);

      if (this._timeout) {
        this._timeout = 0;
        if (this._loop) {
          this.start(args);  // start again if loop and a non-zero delay
        } else {
          this.dispatchEvent(new Event('ended'));
        }
      }
      if (this._timeout && this._loop) {
      }
    };
    if (delay > 0) {
      this.dispatchEvent(new Event('start'));
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
    this._panner = masterContext.createStereoPanner();

    this._originalPan = config['pan'] || 0.0;
    this._panner.pan.value = this._originalPan;  // mutable

    this.linPanTo = Util.curveParamLin.bind(null, this._panner.pan);
  }

  get node() {
    return this._panner;
  }

  get pan() {
    return this._panner.pan.value;
  }

  set pan(value) {
    this._panner.pan.value = value;
  }
}


class AudioBus {
  constructor(config, destination) {
    this._input = masterContext.createGain();
    this._output = masterContext.createGain();

    this._originalInputVolume = config['input_vol'] || 1.0;
    this._originalOutputVolume = config['output_vol'] || 1.0;

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

    this._type = config['group_type'] || 2;
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
    if (this._active) {
      return [this._active];
    } else if (!this._type && this._content[0] && this._content[0].playing) {
      return this._content.slice();
    }
    return [];
  }

  get playing() {
    // Check either the active node (for serial) or the first (for concurrent).
    const check = this._active || this._content[0] || null;
    return check ? check.playing : false;
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
   */
  _each(callback, playLike=false) {
    if (playLike && this.playing) {
      return false;  // do nothing if still playing
    }
    const c = this._content;

    if (!this._type) {
      c.forEach(callback);
      return true;
    }

    if (playLike) {
      // Optionally advance the played audio.
      let index;
      do {
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

    this._active && callback(this._active);
  }

  play(when) {
    this._each((c) => c.play(when), true);
  }

  stop() {
    this._each((c) => c.stop(), false);
  }

  fadeInAndPlay(duration, when) {
    this._each((c) => c.fadeInAndPlay(duration, when), true);
  }

  fadeOutAndStop(duration, when) {
    this._each((c) => c.fadeOutAndStop(duration, when), false);
  }
}


class AudioSource extends EventTarget {
  constructor(config, buffer, destination) {
    super();

    this._buffer = buffer;
    this._startTime = 0;  // startTime of last triggered sound

    // Every AudioSource has its own unique Gain, since we control its volume individually.
    this._output = masterContext.createGain();
    this._output.connect(destination.input);

    // Any currently pending fade callback.
    this._fadeOutTimeout = 0;

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
        console.debug('pitch-shifting', v);
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
  }

  _internalPlay(when) {
    const lastSource = this._sources[0] || null;
    const anyPlaying = Boolean(lastSource);

    if (anyPlaying && (!this._retrig || this._loop)) {
      return false;  // nothing to do: was already playing
    } else if (!this._loop && !this._buffer) {
      return false;  // if there's no buffer, don't "play" once-off sounds
    }

    if (!anyPlaying) {
      this.dispatchEvent(new Event('started'));
    }
    const source = this._createSource();
    source.start(when);
    this._startTime = Math.max(this._startTime, when);
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
      duration = (source.loopEnd || duration) - (source.loopStart || 0);
    }
    return (now - this._startTime) % duration;
  }

  set buffer(buffer) {
    if (buffer === this._buffer) {
      return;
    }

    this._startTime = masterContext.currentTime;  // reset as playing will reset
    this._buffer = buffer;

    this._sources.forEach((source) => {
      source.buffer = buffer;
    });
  }

  get buffer() {
    return this._buffer;
  }

  /**
   * @return {!GainNode}
   */
  get output() {
    return this._output;
  }

  get playing() {
    // nb. This is less good than the previous version.
    return Boolean(this._sources.length);
  }

  set playbackRate(rate) {
    this._playbackRate = rate;  // set for future sources

    this._sources.forEach((source) => {
      const node = source.playbackRate;
      node.cancelScheduledValues(0);
      node.value = rate * this._shiftSource(source);
    });
  }

  get playbackRate() {
    return this._playbackRate;
  }

  curvePlaybackRate(rate, duration, when = masterContext.currentTime) {
    this._playbackRate = rate;  // set for future sources

    this._sources.forEach((source) => {
      const node = source.playbackRate;
      node.cancelScheduledValues(when);
      node.setValueAtTime(node.value, when);
      node.exponentialRampToValueAtTime(rate * this._shiftSource(source), when + duration);
    });
  }

  play(when) {
    this._resetFade();  // clear fade in/out
    this._internalPlay(when || masterContext.currentTime);
  }

  stop() {
    this._resetFade();  // clear fade in/out

    // In retrig, only stops last source (multiple calls will eventually stop all).
    const sourceToStop = this._sources.shift() || null;
    if (sourceToStop === null) {
      return false;
    }
    sourceToStop.stop();
    this.dispatchEvent(new Event('ended'));
    // nb. 'when' wasn't used in the upstream code, and added tons of complexity.
  }

  fadeInAndPlay(duration, when) {
    when = when || masterContext.currentTime;

    // Just play the sound, we're already live. This could include joining an existing 'fade in'
    // session.
    if (this._sources.length && !this._fadeOutTimeout) {
      return this.play(when);
    }

    const wasFading = (this._fadeOutTimeout !== 0);
    window.clearTimeout(this._fadeOutTimeout);
    this._fadeOutTimeout = 0;

    const g = this._output.gain;
    const fadeFrom = wasFading ? g.value : 0;  // either from where we were, or zero
    g.cancelScheduledValues(0);
    g.setValueAtTime(fadeFrom, when);
    g.linearRampToValueAtTime(this._volume, when + duration);

    return this._internalPlay(when);
  }

  fadeOutAndStop(duration, when) {
    const now = masterContext.currentTime;
    when = when || now;

    const g = this._output.gain;
    g.cancelScheduledValues(0);
    g.setValueAtTime(g.value, when);
    g.linearRampToValueAtTime(0, when + duration);

    const after = (when + duration - now) * 1000;
    this._fadeOutTimeout = window.setTimeout(() => this.stop(), after);
  }

  get stopping() {
    return Boolean(this._fadeOutTimeout);
  }
}



export async function prepare() {
  // Load the config into the page (dynamically), as it's ~300kb and doesn't need to be loaded
  // unless the user is actually playing audio. It just creates the `KLANG_CONFIG` global.

  const config = await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = configPath;
    script.onload = () => resolve(window['KLANG_CONFIG']);
    script.onerror = reject;
    document.head.appendChild(script);
  });

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
  console.debug('got', Object.keys(preload).length, 'preload groups');

  Object.assign(audioConfig, config['busses'], config['sequencers'], config['processes']);

  const nodes = {};
  const callback = (key, buffer) => {
    const existing = nodes[key];
    if (existing) {
      existing.buffer = buffer;
    }
  };
  const loader = new AudioLoader(masterContext, audioPath, callback);
  const activeNodes = new Set();

  const prepareKNode = (key, config) => {
    const destination = nodes[config['destination_name']] || null;
    let node;

    switch (config['type']) {
      case 'AudioSource':
        node = new AudioSource(config, loader.get(key), destination);
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

      default:
        throw new Error('unsupported: ' + config['type']);
    }

    if (node instanceof EventTarget) {
      node.addEventListener('started', (ev) => activeNodes.add(node));
      node.addEventListener('ended', (ev) => activeNodes.delete(node));
    }

    return node;
  };

  return {
    transitionTo(events, delay=0.5) {
      // TODO: log what gets kicked off in events, stop all others

      const work = new Set(activeNodes);

      activeNodes.forEach((node) => {
        if (node instanceof AudioGroup) {
          node.active.forEach((sub) => work.delete(sub));
        }
      });

      work.forEach((activeNode) => {
        activeNode.fadeOutAndStop(delay);
      });
    },

    active() {
      return Array.from(activeNodes);
    },

    preload(...groups) {
      const promises = new Set();
      const processes = [];

      const work = (group) => {
        if (!(group in preload)) {
          return;  // bad group
        }
        preload[group].forEach((file, key) => {
          const p = loader.optionalPreload(key, file);
          p && promises.add(p);
        });
      };

      groups.forEach((group) => {
        const key = config['events'][group];
        const process = audioConfig[key];
        if (process && process['type'] === 'SimpleProcess' && process['vars'].length == 0) {
          // TODO: This is a bit ugly, but tries to steal processes that are probably triggering
          // a preload (they might also do other things, which we should prevent).
          processes.push(process['action']);
        }
        work(group);
      });

      try {
        preloadGroupCallback = work;
        processes.forEach((f) => f(null, null, null, null, [], null));
      } finally {
        preloadGroupCallback = null;
      }

      // TODO: callback or progress

      return Promise.all(Array.from(promises)).then(() => null);
    },

    play(event, ...args) {
      const process = config['events'][event] || event;  // get internal name from friendly

      const initialize = [];
      const pendingVars = new Set();

      pendingVars.add(process);
      pendingVars.forEach((key) => {
        if (key in nodes || key === '$OUT') {
          return;  // already parsed
        }

        const c = audioConfig[key];
        if (c === undefined) {
          throw new Error(`invalid key: ${key}`);
        }
        initialize.push({key, config: c});

        const rest = [].concat(
            c['vars'] || [],
            c['destination_name'] || [],
            c['content'] || [],
        );
        rest.forEach((dep) => pendingVars.add(dep));
      });

      initialize.reverse();
      initialize.forEach(({key, config: c}) => {
        nodes[key] = prepareKNode(key, c, nodes);
      });

      const entrypoint = nodes[process];
      if (entrypoint instanceof AudioSource) {
        return entrypoint.play();
      } else if (!(entrypoint instanceof SimpleProcess)) {
        throw new Error('can only run SimpleProcess');
      }

      try {
        activeController = this;
        entrypoint.start(args);
      } finally {
        activeController = null;
      }
    },
  };
}

