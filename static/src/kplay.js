
import {_static} from './magic.js';
import {AudioLoader} from './kplay-lib.js';

const configPath = _static`third_party/lib/klang/config.js`;
const audioPath = _static`audio`;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const masterContext = new AudioContext();



let activeController = null;

const Klang = {
  triggerEvent(name, ...args) {
    if (!activeController) {
      throw new Error('invalid use of Klang');
    }
    console.info('redirect fire', name, args);
    activeController.play(name, ...args);
  },
};
window.Klang = Klang;


const Util = {
  now() {
    return masterContext.currentTime;
  },

  /**
   * @param {!AudioParam} param 
   * @param {number} value 
   * @param {number} duration 
   * @param {number} when 
   */
  curveParamLin(param, value, duration, when) {
    when = when || masterContext.currentTime;
    param.setValueAtTime(param.value, when);
    param.linearRampToValueAtTime(value, when + duration);
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



class SimpleProcess {
  constructor(config, nodes, globalVars) {
    this._nodes = nodes;
    this._globalVars = globalVars;
    this._timeout = 0;
    this._loop = Boolean(config['loop']);

    if (config['type'] === 'AdvancedProcess') {
      if (config['pre_action']['script'] !== 'me.process.stop();') {
        throw new TypeError('expected pre_action to be standard, was: ' + config['pre_action']['script']);
      };
      const [waitOp, execOp] = config['actions'];

      const matchWait = waitOp['script'].match(/(\d+)\,\s*(\d+)/);
      const low = +matchWait[2];
      const high = +matchWait[1];

      this.delay = () => {
        return Math.floor(low + (1 + high - low) * Math.random());
      };

      this._fn = new Function('Core', 'Model', 'Util', 'me', 'args', 'vars', execOp['script']);
    } else {
      this._fn = config['action'];

      if (this._loop) {
        throw new Error('cannot loop SimpleProcess, no delay');
      }
    }
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
    window.clearTimeout(this._timeout);
    this._timeout = 0;
  }

  start(args) {
    if (this._timeout) {
      // Every AdvancedProcess just stops itself on start, resetting the delay.
      window.clearTimeout(this._timeout);
    }

    const delay = this.delay();
    const run = () => {
      this._fn(/** Core */ null, /** Model */ null, Util, this._nodes, args, this._globalVars);

      if (delay && this._loop) {
        this.start(args);  // start again if loop and a non-zero delay
      }
    };
    if (delay > 0) {
      console.info('delaying by', delay, 'seconds');
      this._timeout = window.setTimeout(run, delay * 1000);
    } else {
      run();
    }
  }
}


class AudioBus {
  constructor(config, destination) {
    this._input = masterContext.createGain();
    this._output = masterContext.createGain();

    this._input.gain.value = config['input_vol'] || 1.0;
    this._output.gain.value = config['output_vol'] || 1.0;

    this._effects = [];

    // TODO: insert any effects
    this._input.connect(this._output);

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

/*
CONCURRENT: 0,
STEP: 1,
RANDOM: 2,
SHUFFLE: 3,
BACKWARDS: 4,  // disused
*/

class AudioGroup {
  constructor(config, nodes) {
    this._type = config['group_type'] || 2;

    if (config['retrig']) {
      throw new Error('retrig group?!');
    }

    // _content is needed by config, incorrectly referenced vs 'content'
    this._content = config['content'].map((key) => nodes[key]);
  }

  get content() {
    return this._content;
  }

  get playing() {
    return this._content[0].playing;
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

  play(when) {
    this._content[0].play(when);
  }

  stop() {
    this._content[0].stop();
  }

  fadeInAndPlay(duration, when) {
    this._content[0].fadeInAndPlay(duration, when);
  }

  fadeOutAndStop(duration, when) {
    this._content[0].fadeOutAndStop(duration, when);
  }
}


class AudioSource {
  constructor(config, buffer) {
    this._buffer = buffer;
    this._startTime = 0;  // startTime of last triggered sound

    // Every AudioSource has its own unique Gain, since we control its volume individually.
    this._output = masterContext.createGain();
    this._output.connect(masterContext.destination);

    // Any currently pending fade callback.
    this._fadeOutTimeout = 0;

    // If this is a retrig node, we could be playing it multiple times.
    this._sources = [];

    // Define _shiftSource, which returns a random value in the pitch-shift range on a per-source
    // basis, or consistently 1.0 for none.
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

    this._config = config;
    this._volume = config['volume'] || 1.0;
    this._loop = Boolean(config['loop']);
    this._playbackRate = config['playback_rate'] || 1.0;
    this._retrig = config['retrig'] === undefined ? true : Boolean(config['retrig']);

    if (this._loop) {
      this._retrig = false;
    }
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

      if ('loop_start' in this._config) {
        source.loopStart = this._config['loop_start'];
      }
      if ('loop_end' in this._config) {
        source.loopEnd = this._config['loop_end'];
      }
    }

    source.connect(this._output);

    this._sources.unshift(source);
    source.addEventListener('ended', this._cleanup.bind(this, source), {once: true});

    return source;
  }

  _cleanup(source, ev) {
    // this should probably always be last
    const index = this._sources.lastIndexOf(source);
    if (index !== -1) {
      this._sources.splice(index, 1);
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
    console.debug('internalPlay for', this._config, this._buffer);

    const lastSource = this._sources[0] || null;
    const anyPlaying = Boolean(lastSource);

    if (anyPlaying && (!this._retrig || this._loop)) {
      return false;  // nothing to do: was already playing
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

  const prepareKNode = (key, config) => {
    const destination = nodes[config['destination_name']] || null;

    switch (config['type']) {
      case 'AudioSource':
        return new AudioSource(config, loader.get(key), destination);

      case 'AudioGroup':
        return new AudioGroup(config, nodes);

      case 'AdvancedProcess':
      case 'SimpleProcess':
        return new SimpleProcess(config, nodes, globalVars);

      case 'Bus':
        return new AudioBus(config, destination);
    }

    throw new Error('unsupported: ' + config['type']);
  };

  return {
    preload(...groups) {
      const promises = new Set();

      groups.forEach((group) => {
        if (!(group in preload)) {
          return;  // bad group
        }
        preload[group].forEach((file, key) => {
          const p = loader.optionalPreload(key, file);
          p && promises.add(p);
        });
      });

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

