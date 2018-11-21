import {Adapter} from '@polymer/broadway/lib/adapter';
import {SantaTrackerAction} from '../app/action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from '../app/common.js';


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
    this._donePromise.then(() => cb(1));

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

    p.catch((err) => console.warn('preload error', err)).then(() => {
      ++this._done;

      const ratio = this._done / this._total;
      if (ratio >= 1) {
        this._doneResolve();
      } else {
        // TODO(samthor): This is very noisy. Only send one per every few rAFs?
        this._cb(ratio);
      }
    });
  }

  /**
   * @param {string} event to preload with Klang
   */
  sounds(event) {
    // TODO(samthor): awkwardly pass to window.parent to load for us
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


class SceneManager {
  constructor(sceneName) {
    this._name = sceneName;
    this._adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);
  }

  route(sceneName) {
    this._adapter.dispatch({type: SantaTrackerAction.SCENE_SELECTED, payload: sceneName});
  }

  score(detail) {
    const payload = {
      sceneName: this._name,
      detail,
    };
    this._adapter.dispatch({type: SantaTrackerAction.SCORE_UPDATE, payload});
  }
}


/**
 * Scene API helper which exposes a `.preload` property to scenes which allows preloading assets
 * as part of traditional 'loading' before the Controller is activated.
 *
 * Pass a method to `.ready` which will be invoked once preload is complete. This method will be
 * passed an instance of `SceneManager`, which connects to and exposes the Controller.
 *
 * e.g.:
 *    const api = new SceneApi('scene-name-here');
 *    api.preload.images(...);
 *    api.ready(async (manager) => { ... });
 */
class SceneApi {
  constructor(sceneName) {
    this._name = sceneName;
    this._manager = null;

    let updateProgress = (ratio) => {};

    // This breaks the Actor model abstraction during loading, and we just post progress directly
    // to our parent (if we have one). This lets us pretend that loading is a task that just takes
    // time, and which is managed entirely by `santa-loader`.
    const isInFrame = Boolean(window.parent);
    if (isInFrame) {
      // Rather than posting lots of messages, just send a single message with a MessagePort.
      const mc = new MessageChannel();
      window.parent.postMessage('init', '*', [mc.port2]);
      updateProgress = (ratio) => mc.port1.postMessage(ratio);
    }

    this._preload = new PreloadApi(updateProgress);
    this._preload.done.then(() => updateProgress(null));  // post null to indicate done
  }

  /**
   * @param {function(): !Promise<undefined>} fn 
   */
  async ready(fn) {
    await this._preload.done;

    this._manager = new SceneManager(this._name);
    await fn(this._manager);
  }

  get preload() {
    return this._preload;
  }

  installV1Handlers() {
    const fire = (eventName, arg) => {
      console.info('got fired', eventName, this._manager);
      if (!this._manager) {
        return;
      }

      // TODO(samthor): do something with events
      switch (eventName) {
      case 'sound-trigger':
        break;
      case 'sound-ambient':
        break;
      case 'game-score':
        this._manager.score(arg);
        break;
      case 'game-stop':
        // TODO(samthor): game is stopped
        break;
      }
  }

    window.santaApp = {fire};
    window.ga = function() {
      // TODO(samthor): log GA events
    };
  }
}

// Identify the sceneName from the loaded URL.
const sceneNameRe = /\/scenes\/(\w+)\//;
const match = sceneNameRe.exec(window.location.pathname);
if (!match) {
  throw new TypeError('could not identify scene name from pathname: ' + window.location.pathname);
}
const sceneName = match[1];

const sceneApi = new SceneApi(sceneName);
export default sceneApi;

