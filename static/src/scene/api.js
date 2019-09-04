import '../polyfill/event-target.js';
import * as channel from '../lib/channel.js';


class PreloadApi {

  /**
   * @param {function(number): void} callback to be called with fraction complete
   */
  constructor(callback) {
    this._refs = [];  // reference images being loaded, so they're not discarded
    this._total = 0;
    this._done = 0;
    this._callback = callback;

    this._donePromise = new Promise((resolve) => {
      this._doneResolve = resolve;
    });
    this._donePromise.then(() => {
      callback(1);
      this._callback = () => {};  // do nothing from here-on-in
    });
    callback(0);

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
        this._callback(ratio);
      }
    });
  }

  /**
   * @param {string} event to preload with Klang
   */
  sounds(event) {
    // TODO(samthor): awkwardly pass to window.parent to load for us

    const {port1, port2} = new MessageChannel();
    this._callback(event, [port1]);

    this.wait(new Promise((resolve) => {
      port2.onmessage = (status) => {
        console.info('got status', status, 'for klang', event);
        resolve();
      };
    }));
  }

  /**
   * @param {...string} all image URLs to preload
   * @return {!Array<!Promise<!Image>>} resolved images
   */
  images(...all) {
    return all.map((src) => {
      const p = new Promise((resolve, reject) => {
        const image = new Image();
        this._refs.push(image);
        image.src = src;
        image.onload = () => resolve(image);
        image.onerror = reject;
      });
      this.wait(p);
      return p;
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
    this._initialData = null;
    this._config = null;

    // connect to parent frame: during preload, error on data
    this._updateFromHost = (data) => {
      if (data.type === 'data') {
        this._initialData = data.payload;
        return;
      }
      throw new Error('got unexpected early data from host');
    };
    this._updateParent = channel.parent('init', (data) => this._updateFromHost(data));
    this._preload = new PreloadApi(this._updateParent);

    // queue of events sent by the game during preload
    const sendQueue = [];
    this._send = (type, payload) => sendQueue.push({type, payload});

    // after preload, do a bunch of setup work
    this._ready = (async() => {

      await this._preload.done;
      this._updateParent(null);  // preload is done

      this._updateFromHost = ({type, payload}) => this._handleHostMessage(type, payload);
      this._send = (type, payload) => this._updateParent({type, payload});

      // send ready event
      // TODO: allow scenes to configure these options
      this._send('ready', {hasPauseScreen: true});

      // clear backlog of events
      sendQueue.forEach(this._updateParent)

      // focus ourselves (useful for embed and testing)
      lazyFocusPage();
    })();
  }

  _handleHostMessage(type, payload) {
    console.info('hostMessage', type, payload);
    switch (type) {
      case 'pause':
      case 'resume':
      case 'restart':
        this.dispatchEvent(new Event(type));
        break;
      default:
        console.debug('unhandled hostMessage', type);
    }
  }

  config(arg) {
    if (this._config) {
      throw new Error('config should only be called once');
    }
    this._config = arg;
    return this;
  }

  /**
   * @param {function(*): !Promise<undefined>} fn 
   * @param {{hasPauseScreen: boolean}=}
   */
  async ready(fn) {
    await this._ready;
    await fn(this._initialData);
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

  /**
   * @param {string} sound to play via Klang
   * @param {*=} arg to pass
   */
  play(sound, arg=undefined) {
    this._klang('play', sound, arg);
  }

  /**
   * @param {string} sound to fire via Klang
   */
  fire(sound) {
    this._klang('fire', sound);
  }

  /**
   * @param {string} startEvent ambient sound event to play
   * @param {?string=} endEvent ambient event to trigger on new ambient
   */
  ambient(startEvent, endEvent=null) {
    this._klang('ambient', startEvent, endEvent);
  }

  _klang(...args) {
    this._send('klang', args);
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
 * Lazy focus on this page.
 */
function lazyFocusPage() {
  var x = document.createElement('button');
  x.setAttribute('tabindex', 0);
  document.body.appendChild(x);
  x.focus();
  document.body.removeChild(x);
}


/**
 * Installs handlers for V1 games, including `santaApp` and global `ga`.
 */
function installV1Handlers() {
  window.ga = sceneApi.ga.bind(sceneApi);

  const fire = (eventName, ...args) => {
    switch (eventName) {
    case 'sound-fire':
      sceneApi.fire(args[0]);
      break;
    case 'sound-play':
    case 'sound-trigger':  // old-style
      sceneApi.play(args[0], args[1]);
      break;
    case 'sound-transition':
      sceneApi._klang('transition', ...args);
      break;
    case 'sound-ambient':
      sceneApi.ambient(args[0], args[1]);
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
    default:
      console.debug('unhandled santaApi.fire', eventName)
    }
  }

  window.santaApp = {
    fire,
    headerSize: 0,
  };
}

installV1Handlers();


