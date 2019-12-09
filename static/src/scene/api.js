import '../polyfill/event-target.js';
import * as channel from '../lib/channel.js';
import {resolvable} from '../lib/promises.js';
import {read} from '../lib/params.js';

import {globalClickHandler} from '../core/router.js';
import {scope} from './route.js';

const PARENT_PRELOAD_TIMEOUT = 15 * 1000;  // individual preload timeout, e.g., for Klang
const LOAD_TIMEOUT = 20 * 1000;            // total preload timeout

class PreloadApi {

  /**
   * @param {function(number): void} callback to be called with fraction complete
   */
  constructor(callback) {
    this._refs = [];  // reference images being loaded, so they're not discarded
    this._total = 0;
    this._done = 0;
    this._callback = callback;

    const r = resolvable();
    this._donePromise = r.promise.catch((err) => console.warn('preload err', err));
    this._doneResolve = r.resolve;

    this._donePromise.then(() => {
      callback({type: 'progress', payload: 1});
      this._callback = () => {};  // do nothing from here-on-in
    });
    callback({type: 'progress', payload: 0});

    // Add a single task that resolves after setTimeout to ensure that the preloader fires at all.
    const framePromise = new Promise((r) => window.setTimeout(r, 0));
    this.wait(framePromise);
  }

  get done() {
    return this._donePromise;
  }

  /**
   * @param {!Promise<*>} p to wait for before resolving preload
   */
  wait(p) {
    ++this._total;

    p.catch((err) => console.warn('preload error', err)).then(() => {
      ++this._done;

      const ratio = this._done / this._total;
      if (ratio >= 1) {
        this._doneResolve();
      } else {
        this._callback({type: 'progress', payload: ratio});
      }
    });
  }

  /**
   * @param {string} type of thing to preload from prod
   * @param {string} event name of thing to preload from prod
   */
  prod(type, event) {
    if (!channel.withinFrame) {
      return false;  // nothing to do, not in a frame
    }

    const {port1, port2} = new MessageChannel();
    this._callback({type: 'preload', payload: [type, event, port1]}, [port1]);

    // nb. This used to be more complex when we showed a loading indicator; however, it's been
    // streamlined so we just wait for a null "done" message.
    const p = new Promise((resolve, reject) => {
      port2.onmessage = (ev) => {
        if (ev.data === null) {
          resolve();
        }
      };
      window.setTimeout(reject, PARENT_PRELOAD_TIMEOUT);
    });

    this.wait(p);
  }

  /**
   * @param {string} event to preload with Klang
   */
  sounds(event) {
    this.prod('sounds', event);
  }

  /**
   * @param {...string} all image URLs to preload
   * @return {!Array<!Promise<!Image>>} resolved images
   */
  images(...all) {
    return all.map((src) => {
      const image = new Image();
      const p = new Promise((resolve, reject) => {
        this._refs.push(image);
        image.src = src;
        image.onload = () => resolve(image);
        image.onerror = reject;
      });
      this.wait(p);
      return p.catch(() => image);  // return the image anyway
    });
  }
}


/**
 * Scene API helper which exposes a `.preload` property to scenes which allows preloading assets
 * as part of traditional 'loading' before the Controller is activated.
 *
 * Games should configure event handlers and config in the initial frame.
 * 
 * Pass a method to `.ready` which will be invoked once preload is complete.
 *
 * e.g.:
 *    const api = new SceneApi();
 *    api.preload.images(...);
 *    api.ready(async () => { ... });
 */
class SceneApi extends EventTarget {
  constructor() {
    super();
    this._initialData = {};
    this._params = read(window.location.search);
    this._loaded = false;

    // FIXME: This Promise is badly named vs. this._ready, which is the prep work.
    if (channel.withinFrame) {
      const r = resolvable();
      this._readyPromise = r.promise;
      this._readyResolve = r.resolve;
    } else {
      // just pretend to be ready for dev
      this._readyPromise = Promise.resolve();
      this._readyResolve = () => {};

      // ... and insert data for testing
      // (this won't work in IE11 and friends, but we're not testing here anyway)
      const p = new URLSearchParams(window.location.search);
      p.forEach((value, key) => {
        this._initialData[key] = value;
      });
    }

    // connect to parent frame during preload
    this._updateFromHost = (data) => {
      const {type, payload} = data;

      switch (type) {
        case 'ready':
          this._readyResolve();
          break;

        case 'data':
          this._initialData = payload || {};
          this.dispatchEvent(new CustomEvent('data', {detail: payload}))
          break;

        default:
          // can happen if we've given up on preload
          console.warn(`got unexpected early data from host: ${type}`);
      }

    };
    this._updateParent = channel.parent('init', (data) => this._updateFromHost(data));
    this._preload = new PreloadApi(this._updateParent);

    // queue of events sent by the game during preload
    const sendQueue = [];
    this._send = (type, payload) => sendQueue.push({type, payload});

    // after preload, do a bunch of setup work (with timeout)
    const race = Promise.race([
      this._preload.done,
      new Promise((r) => window.setTimeout(r, LOAD_TIMEOUT))
    ]);
    this._ready = race.then(() => {
      // send loaded event, ignoring future preload notices
      this._updateParent({type: 'loaded'});
      this._loaded = true;

      // wait for frame to tell us to go
      return this._readyPromise;
    }).then(() => {
      this._updateFromHost = ({type, payload}) => this._handleHostMessage(type, payload);

      // clear backlog of events
      this._send = (type, payload) => this._updateParent({type, payload});
      sendQueue.forEach((message) => this._updateParent(message));
    });
  }

  param(id) {
    return this._params[id] || '';
  }

  _handleHostMessage(type, payload) {
    switch (type) {
      case 'data':
        // arrives in subscribe case
        this.dispatchEvent(new CustomEvent('data', {detail: payload}))
        break;

      case 'pause':
        this.dispatchEvent(new Event(type));
        sceneApi.play("global_pause");
        break;
      case 'resume':
        this.dispatchEvent(new Event(type));
        sceneApi.play("global_unpause");
        break;
      case 'restart':
        const event = new Event(type);
        this.dispatchEvent(event);

        if (type === 'restart' && event.defaultPrevented) {
          this._send('reload');
        }
        break;

      case 'muted':
      case 'unmuted':
        this.dispatchEvent(new CustomEvent(type));
        break;

      case 'deviceorientation':
      case 'keyup':
      case 'keydown': {
        // TODO(samthor): This also sends us 'repeat' events, and mixes badly (?) with keyboard
        // inputs. It might be worth merging them, but only if a game isn't explicitly multiplayer.
        const event = new CustomEvent(type, {bubbles: true});
        Object.assign(event, payload);
        document.dispatchEvent(event);
        break;
      }
      default:
        console.debug('unhandled hostMessage', type);
    }
  }

  config(arg) {
    if (this._loaded) {
      throw new Error('config called after load');
    }
    this._updateParent({type: 'config', payload: arg});
    return this;
  }

  /**
   * @param {function(!Object): *} fn
   * @return {!Promise<void>}
   */
  ready(fn) {
    return this._ready.then(() => fn(this._initialData)).then(() => undefined);
  }

  get preload() {
    return this._preload;
  }

  /**
   * @param {string} route to go to
   */
  go(route) {
    this._send('go', route);
  }

  /**
   * @param {*} data to set for this scene
   */
  data(data) {
    this._send('data', data);
  }

  tutorialQueue(...arg) {
    this._send('tutorial-queue', arg);
  }

  tutorialDismiss(...arg) {
    this._send('tutorial-dismiss', arg);
  }

  /**
   * @param {string} sound to play via Klang
   * @param {...*} args to pass
   */
  play(sound, ...args) {
    this._send('play', [sound, ...args]);
  }

  score(detail) {
    this._send('score', detail);
  }

  gameover(detail) {
    this._send('gameover', detail);
  }

  ga(...args) {
    this._send('ga', args);
  }
}


const sceneApi = new SceneApi();
export default sceneApi;


/**
 * Installs handlers for V1 games, including `santaApp` and global `ga`.
 */
function installV1Handlers() {
  window.ga = sceneApi.ga.bind(sceneApi);

  const sanitizeSoundArgs = (args) => {
    if (args.length !== 1) {
      return args;
    }
    const first = args[0];
    if (first.name && first.args && first.args instanceof Array) {
      // fix "{name: 'foo', args: []}" case
      args = [first.name, ...first.args];
    }
    return args;
  };

  window.addEventListener('santa-play', (ev) => {
    const kplayEvent = ev.detail[0];
    const args = ev.detail.slice(1);
    sceneApi.play(kplayEvent, args);
  });

  const fire = (eventName, ...args) => {
    switch (eventName) {
      case 'sound-trigger':
      case 'sound-ambient':
        args = sanitizeSoundArgs(args);
        sceneApi.play(...args);
        break;

      case 'game-data':
        sceneApi.data(args[0] || null);
        break;

      case 'game-score':
        sceneApi.score(args[0] || {});
        break;

      case 'game-stop':
        sceneApi.gameover(args[0] || {});
        break;

      case 'tutorial-queue':
        sceneApi.tutorialQueue(...(args[0] || []));
        break;

      case 'tutorial-dismiss':
        sceneApi.tutorialDismiss(...(args[0] || []));
        break;

      default:
        console.debug('unhandled santaApi.fire', eventName);
    }
  }

  window.santaApp = {
    fire,
    headerSize: 0,
  };
}

window.addEventListener('sound-trigger', (ev) => sceneApi.play(ev.detail));

installV1Handlers();

const handler = globalClickHandler(scope, (sceneName) => sceneApi.go(sceneName));
document.body.addEventListener('click', handler);
