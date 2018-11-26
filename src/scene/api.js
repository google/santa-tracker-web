import '../polyfill/event-target.js';
import * as channel from '../lib/channel.js';


const params = new URLSearchParams(window.location.search);
const isEmbed = params.has('_embed');


const pendingSoundPreload = [];


class PreloadApi {

  /**
   * @param {function(number): void} cb to be called with fraction complete
   */
  constructor(cb) {
    this._total = 0;
    this._done = 0;
    this._cb = cb;

    this._donePromise = new Promise((resolve) => {
      this._doneResolve = resolve;
    });
    this._donePromise.then(() => {
      this._cb(1);
      this._cb = () => {};  // do nothing from here-on-in
    });

    // If nothing was requested after a frame, then assume that nothing ever will be, and resolve
    // the preloader Promise immediately. Note that this can't be a rAF, as the iframe is probably
    // hidden.
    Promise.resolve().then(() => {
      if (this._total === 0) {
        this._doneResolve();
      }
    });

    // Keep a reference to the assets being loaded, otherwise browsers like to discard them almost
    // immediately.
    this._refs = [];
  }

  get done() {
    return this._donePromise;
  }

  /**
   * @param {!Promise<*>} p to wait for before resolving preload
   */
  wait(p) {
    if (this._total === 0) {
      this._cb(0);
    }
    ++this._total;

    p.catch((err) => console.warn('preload error', err, err.target)).then(() => {
      ++this._done;

      const ratio = this._done / this._total;
      if (ratio >= 1) {
        this._doneResolve();
      } else {
        this._cb(ratio);
      }
    });
  }

  /**
   * @param {string} event to preload with Klang
   */
  sounds(event) {
    // TODO(samthor): awkwardly pass to window.parent to load for us
    pendingSoundPreload.push(event);
  }

  /**
   * @param {...string} all image URLs to preload
   */
  images(...all) {
    for (const src of all) {
      const p = new Promise((resolve, reject) => {
        const image = new Image();
        this._refs.push(image);
        image.src = src;
        image.onload = resolve;
        image.onerror = reject;
      });
      this.wait(p);
    }
  }

  /**
   * @param {...string} all URLs to preload via XHR
   */
  paths(...all) {
    for (const src of all) {
      const p = new Promise((resolve, reject) => {
        const x = new XMLHttpRequest();
        this._refs.push(x);
        x.open('GET', src);
        x.onload = resolve;
        x.onerror = reject;
        x.send(null);
      });
      this.wait(p);
    }
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

      // In embed, we need to load the soundcontroller directly and have it listen to events
      // on the body. Otherwise it's incredibly tricky to get a user gesture to resume audio.
      if (isEmbed) {
        const script = document.createElement('script');
        script.setAttribute('type', 'module');
        script.src = _root`src/soundcontroller-embed.bundle.js`;
        document.body.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });

        // start muted
        document.body.dispatchEvent(new CustomEvent('_klang', {detail: ['global_sound_off']}));
        const muteDelayPromise = new Promise((r) => window.setTimeout(r, 500));
        this._preload.wait(muteDelayPromise);
      }

      await this._preload.done;
      this._updateParent(null);  // preload is done

      this._updateFromHost = ({type, payload}) => this._handleHostMessage(type, payload);
      this._send = (type, payload) => this._updateParent({type, payload});

      // FIXME: send awkward preload events
      pendingSoundPreload.forEach((event) => this.fire(event));

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
      case 'embed:unmute':
        this._klang('fire', 'global_sound_on');
        break;
      case 'embed:mute':
        this._klang('fire', 'global_sound_off');
        break;
      default:
        console.debug('unhandled hostMessage', type);
    }
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
    if (isEmbed) {
      document.body.dispatchEvent(new CustomEvent('_klang', {detail: args}));
    } else {
      this._send('klang', args);
    }
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
 * Installs handlers for V1, including `santaApp` and global `ga`.
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
    case 'sound-ambient':
      sceneApi.ambient(args[0], args[1]);
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


