/**
 * @fileoverview Main entrypoint for Santa Tracker. Runs in the prod domain.
 */

import './src/elements/santa-chrome.js';
import './src/elements/santa-countdown.js';
import * as gameloader from './src/elements/santa-gameloader.js';
import './src/elements/santa-sidebar.js';
import './src/elements/santa-error.js';
import './src/elements/santa-interlude.js';
import * as kplay from './src/kplay.js';
import scenes from './src/strings/scenes.js';
import {_msg, join} from './src/magic.js';
import {configureProdRouter, globalClickHandler} from './src/core/router.js';
import {sceneImage} from './src/core/assets.js';
import {resolvable} from './src/lib/promises.js';


const kplayReady = kplay.prepare();


// TODO(samthor): If this doesn't work, we need a foreground unmute button, as clicking on the
// iframe probably won't trigger it.
//sc.installGestureResume(document.body);


const loaderElement = document.createElement('santa-gameloader');
const interludeElement = document.createElement('santa-interlude');
const chromeElement = document.createElement('santa-chrome');
document.body.append(chromeElement, loaderElement, interludeElement);

const errorElement = document.createElement('santa-error');
loaderElement.append(errorElement);

const sidebar = document.createElement('santa-sidebar');
sidebar.todayHouse = 'snowball';
sidebar.setAttribute('slot', 'sidebar');
chromeElement.append(sidebar);


kplayReady.then((sc) => {
  if (sc.suspended) {
    console.warn('Web Audio API is suspended, requires user interaction to start');
    document.body.addEventListener('click', () => sc.resume(), {once: true});
  }
});


async function preloadSounds(sc, event, port) {
  await sc.preload(event, (done, total) => {
    port.postMessage({done, total});
  });
  port.postMessage(null);
}


async function runner(control, ready, initialData) {
  const sc = await kplayReady;

  const preloadWork = [];
  const config = {};

outer:
  for await (const data of control) {
    if (data === null) {
      throw new Error('scene failed to load');
    }

    const {type, payload} = data;
    switch (type) {
      case 'error':
        return Promise.reject(payload);

      case 'progress':
        console.debug('got preload', (payload * 100).toFixed(2) + '%');
        continue;

      case 'preload':
        const [preloadType, event, port] = payload;
        if (preloadType !== 'sounds') {
          throw new TypeError(`unsupported preload: ${payload[0]}`);
        }
        // TODO: don't preload sounds if the AudioContext is suspended, queue for later.
        preloadWork.push(preloadSounds(sc, event, port));
        continue;

      case 'ready':
        await Promise.all(preloadWork);
        ready();
        Object.assign(config, payload);

        chromeElement.mini = !config.scroll;
        sc.transitionTo(config.sound || [], 1.0);

        break outer;
    }

    console.warn('got unhandled preload', data);
  }

  for await (const data of control) {
    if (data === null) {
      break;
    }

    const {type, payload} = data;
    switch (type) {
      case 'error':
        return Promise.reject(payload);
    }

    console.debug('got active data', data);
  }

  for await (const data of control) {
    console.debug('got post-shutdown data', data);
  }
}


let interludePromise = Promise.resolve(null);


loaderElement.addEventListener(gameloader.events.load, (ev) => {
  // Load process is started. This is triggered every time a new call to .load() is made, even if
  // the previous load isn't finished yet. It's suitable for enabling or updating an interstitial.
  interludePromise = interludeElement.show();
  chromeElement.navOpen = false;
});


loaderElement.addEventListener(gameloader.events.error, (ev) => {
  const {error, context} = ev.detail;
  const {sceneName} = context;
  loaderElement.load(null, {error, sceneName});
});


loaderElement.addEventListener(gameloader.events.prepare, (ev) => {
  // A new frame is being loaded. It's not yet visible (although its onload event has fired by now),
  // but the prior frame is now deprecated and is inevitably going to be removed.
  // It's possible that the new frame is null (missing/404/empty): in this case, control is null.

  const {context, resolve, control, ready} = ev.detail;
  const {data, sceneName, error} = context;

  // Configure `santa-error`, if needed.
  if (error) {
    errorElement.code = 'internal';
  } else if (!control && sceneName) {
    errorElement.code = 'missing';
  } else {
    errorElement.code = null;
  }
  errorElement.textContent = '';  // clear previous image
  errorElement.lock = false;

  // FIXME: the error display has a higher z-index than the interstitial. Also, its elements can
  // still be focused.

  // TODO(samthor): This is a bit gross. But we basically give our `ready()` method the union of
  // the runner ready callback and the interlude animation, so we only finish up when the interlude
  // is done.
  const {promise: fauxReadyPromise, resolve: fauxReadyResolve} = resolvable();
  const union = Promise.all([fauxReadyPromise, interludePromise]).then(() => {
    interludeElement.removeAttribute('active');
  });
  ready(union);

  if (control) {
    resolve(runner(control, fauxReadyResolve, data));
  } else {
    const emptyRunner = async () => {
      if (sceneName && !error) {
        let img;
        try {
          img = await sceneImage(santaApp.route);
        } catch (e) {
          img = null;
        }
        if (img) {
          img.setAttribute('slot', 'icon');
          errorElement.append(img);
        }
        errorElement.lock = true;
      }
      fauxReadyResolve();
    };
    resolve(emptyRunner());
  }
});



let loadedScene = undefined;

const loaderScene = (sceneName, data) => {
  if (sceneName === loadedScene) {
    return false;
  }

  const title = scenes[sceneName] || '';
  if (title) {
    document.title = `${title} · ${_msg`santatracker`}`;
  } else {
    document.title = _msg`santatracker`;
  }

  const locked = ['tracker'].indexOf(sceneName) !== -1;
  const url = locked ? null : join(import.meta.url, 'scenes', (sceneName || 'index') + '/');

  loadedScene = sceneName;

  const context = {sceneName, data};
  loaderElement.load(url, context).then((success) => {
    if (success) {
      console.info('loading done', sceneName, url);
    } else {
      console.warn('loading superceded', sceneName);
    }
  });
};


const {scope, go} = configureProdRouter(loaderScene);
document.body.addEventListener('click', globalClickHandler(scope, go));

