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

import '../polyfill/event-target.js';
import * as channel from '../lib/channel.js';
import {resolvable} from '../lib/promises.js';
import {read} from '../lib/params.js';

import {globalClickHandler} from '../core/router.js';
import {scope} from './route.js';
import {dashCamelCase} from '../lib/case.js';

import * as common from '../core/common.js';

/**
 * On creation, configure frame connecting to parent. This announces preload events (which can
 * happen after preload actually "completes").
 */
const sceneApi = (function() {
  const params = read(window.location.search);
  const handlers = [];

  const {talkback, ready} = (function() {
    if (!channel.withinFrame) {
      return {
        talkback() {},
        ready: Promise.resolve(params),  // use params as data for testing
      };
    }

    let data = null;
    const r = resolvable();
    const talkback = channel.parent(({type, payload}) => {
      switch (type) {
        case 'data':
          data = payload;  // save here but allow handlers to run, for initial payload
          break;

        case 'ready':
          return r.resolve(data || {});
      }
      handlers.some((handler) => handler(type, payload));
    });
  
    return {talkback, ready: r.promise};
  }());

  // Configure preload, which reports +ve tasks (work to do) and -ve updates (work done).
  const resolveTask = () => talkback({type: 'tasks', payload: -1});
  window.addEventListener(common.preloadEvent, (ev) => {
    const tasks = /** @type {!Array<!Promise>} */ (ev.detail);
    talkback({type: 'tasks', payload: tasks.length});
    tasks.forEach((t) => t.catch(() => null).then(resolveTask));
  });

  // Just let the parent there's sounds to preload. This is ignored by the fallback host.
  window.addEventListener(common.internalSoundPreload, (ev) => {
    talkback({type: 'sounds', payload: ev.detail});
  });

  // Create shared default exported object. Used by scenes.
  const target = new (class extends EventTarget {
    constructor() {
      super();
      this._config = undefined;
    }

    get preload() {
      return common.preload;
    }
 
    /**
     * Returns the value of a param passed to this frame. Used for route.
     *
     * @param {string} key to return
     * @return {string}
     */
    param(key) {
      return params[key] || '';
    }

    config(data = {}) {
      this._config = data;
    }

    _bufferList(type, ...args) {
      this._buffer(type, args);
    }

    _buffer(type, payload) {
      this.ready(() => talkback({type, payload}));
    }

    /**
     * Call a method when the scene is ready to load.
     */
    ready(fn) {
      return ready.then(fn);
    }
  });

  // Push general event handler. This handles control from parent frame and dispatches events on
  // API, which is an EventTarget.
  handlers.push((type, payload) => {
    switch (type) {
      case 'data':
        target.dispatchEvent(new CustomEvent('data', {detail: payload}));
        return true;

      case 'pause':
      case 'resume':
      case 'restart':
      case 'muted':
      case 'unmuted':
        target.dispatchEvent(new Event(type));
        return true;

      case 'deviceorientation':
      case 'keyup':
      case 'keydown':
        // TODO(samthor): This also sends us 'repeat' events, and mixes badly (?) with keyboard
        // inputs. It might be worth merging them, but only if a game isn't explicitly multiplayer.
        const event = new CustomEvent(type, {bubbles: true});
        Object.assign(event, payload);
        document.dispatchEvent(event);
        return true;
    }
  });

  // Announce the config after a short leeway (this is longer than a microtask, as `Promise.resolve`
  // is used to kick off the first tasks).
  window.setTimeout(() => {
    talkback({type: 'config', payload: target._config || {}});
    target.config = () => {
      throw new TypeError('config() cannot be called after first tick');
    };
    target._config = undefined;
  }, 100);

  // Add generic helpers to the API object, used by scenes. If true, accepts any number of params
  // which are passed as an Array. If false, just sends a single argument.
  const bufferNames = {
    'tutorialQueue': true,
    'tutorialDismiss': true,
    'ga': true,
    'play': true,
    'data': false,
    'score': false,
    'gameover': false,
    'go': false,
    'error': false,
  };
  for (const key in bufferNames) {
    const listType = bufferNames[key];
    const method = listType ? target._bufferList : target._buffer;
    const type = dashCamelCase(key);  // 'tutorialQueue' becomes 'tutorial-queue'
    target[key] = method.bind(target, type);
  }

  // Add global Analytics passthrough.
  window.ga = target.ga;

  // Handle common sound playback code. This is buffered just like `api.play()`.
  window.addEventListener(common.playEvent, (ev) => target.play(...ev.detail));

  // Handle common routing code.
  window.addEventListener(common.goEvent, (ev) => target.go(ev.detail));

  // Force at least one preload task.
  common.preload.wait(Promise.resolve());

  return target;
}());

/**
 * Installs `santaApp` global handler.
 */
function buildLegacyHandler() {
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

  return {
    fire,
    get headerSize() {
      // leftover from old (2017-era) design, with a fixed height header
      return 0;
    },
  };
}

window.santaApp = buildLegacyHandler();

// Install global click handler, for primary page nav.
const handler = globalClickHandler(scope, (sceneName) => sceneApi.go(sceneName));
document.body.addEventListener('click', handler);

export default sceneApi;
