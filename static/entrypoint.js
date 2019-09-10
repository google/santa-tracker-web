/**
 * @fileoverview Main entrypoint for Santa Tracker. Runs in the prod domain.
 */

import './src/elements/santa-chrome.js';
import './src/elements/santa-countdown.js';
import * as gameloader from './src/elements/santa-gameloader.js';
import './src/elements/santa-sidebar.js';
import './src/elements/santa-error.js';
import * as kplay from './src/kplay.js';
import scenes from './src/strings/scenes.js';
import {_msg, join} from './src/magic.js';
import {configureProdRouter, globalClickHandler} from './src/core/router.js';
import {sceneImage} from './src/core/assets.js';


const kplayReady = kplay.prepare();


// TODO(samthor): If this doesn't work, we need a foreground unmute button, as clicking on the
// iframe probably won't trigger it.
//sc.installGestureResume(document.body);


const loader = document.createElement('santa-gameloader');
const chrome = document.createElement('santa-chrome');
document.body.append(chrome, loader);

const error = document.createElement('santa-error');
loader.append(error);


const sidebar = document.createElement('santa-sidebar');
sidebar.todayHouse = 'snowball';
sidebar.setAttribute('slot', 'sidebar');
chrome.append(sidebar);


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

        chrome.mini = !config.scroll;
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

loader.addEventListener(gameloader.events.load, (ev) => {
  // Load process is starting. This is only triggered once, even if multiple loads intercept each
  // other. We should start the display of any interstitial here.
  console.debug('1. LOAD; previous frame should be killed');
});


loader.addEventListener(gameloader.events.error, (ev) => {
  loader.load(null, ev.detail);
});


loader.addEventListener(gameloader.events.prepare, (ev) => {
  // A new frame is being loaded. It's not yet visible (although its onload event has fired by now),
  // but the prior frame is now deprecated and is inevitably going to be removed.
  // It's possible that the new frame is null (missing/404/empty): in this case, control is null.

  const {context, resolve, control, ready} = ev.detail;
  const {data, sceneName} = context;

  // Configure `santa-error`, if needed.
  if (context instanceof Error) {
    error.code = 'internal';
  } else if (!control && sceneName) {
    error.code = 'missing';
  } else {
    error.code = null;
  }

  if (control) {
    resolve(runner(control, ready, data));
  } else {
    // this is an error or empty frame
    ready();
    resolve();
  }
});



// loader.addEventList
//     error.lock = true;
//     let img;
//     try {
//       img = await sceneImage(santaApp.route);
//     } catch (e) {
//       console.warn('err img', e);
//       return;  // ignore, bad image
//     }
//     img.setAttribute('slot', 'icon');
//     error.append(img);
//     error.lock = true;
//     error.error = false;
//     chrome.mini = false;
//   };
//   resolve(handler());
// });




const loaderScene = (sceneName, data) => {
  const title = scenes[sceneName] || '';
  if (title) {
    document.title = `${title} · ${_msg`santatracker`}`;
  } else {
    document.title = _msg`santatracker`;
  }

  const locked = ['tracker'].indexOf(sceneName) !== -1;
  const url = locked ? null : join(import.meta.url, 'scenes', (sceneName || 'index') + '/');

  if (loader.href === url) {
    return false;
  }

  const context = {sceneName, data};
  loader.load(url, context).then((success) => {
    if (success) {
      console.info('loading done', url);
    } else {
      console.warn('loading superceded', url);
    }
  });
};


const {scope, go} = configureProdRouter(loaderScene);
document.body.addEventListener('click', globalClickHandler(scope, go));

