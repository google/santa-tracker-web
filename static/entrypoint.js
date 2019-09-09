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
  soundcontroller = sc;
  if (sc.suspended) {
    console.warn('Web Audio API is suspended, requires user interaction to start');
    document.body.addEventListener('click', () => sc.resume(), {once: true});
  }
});


async function preloadSounds(event, port) {
  const sc = await kplayReady;
  await sc.preload(event, (done, total) => {
    port.postMessage({done, total});
  });
  port.postMessage(null);
}


async function preload(control, ready) {
  const preloadWork = [];

  for await (const data of control) {
    if (data === null) {
      await Promise.all(preloadWork);
      ready();
      continue;
    }

    const {type, payload} = data;
    switch (type) {
      case 'progress':
        console.debug('got preload', (payload * 100).toFixed(2) + '%');
        continue;

      case 'preload':
        const [preloadType, event, port] = payload;
        if (preloadType !== 'sounds') {
          throw new TypeError(`unsupported preload: ${payload[0]}`);
        }
        preloadWork.push(preloadSounds(event, port));
        continue;

      case 'ready':
        console.info('got config', payload);
        continue;
    }

    console.warn('got unhandled preload', data);
  }
}


loader.addEventListener(gameloader.events.ready, (ev) => {
  const {resolve, control, ready} = ev.detail;
  resolve(preload(control, ready));
});




/**
 * Handle preload, ostensibly for any data loaded by the parent frame, but really just for Klang.
 */
// loader.addEventListener(gameloader.events.preload, (ev) => {
//   const {event, update, resolve} = ev.detail;
//   const work = async () => {
//     const parts = event.split(':');
//     if (parts[0] !== 'sounds') {
//       throw new TypeError(`expected preload for sounds, was: ${event}`);
//     }

//     const sc = await kplayReady;
//     await sc.preload(parts[1], (done, total) => update({done, total}));
//   };
//   resolve(work());
// });


let activePort = null;
let soundcontroller = null;


// loader.addEventListener(gameloader.events.ready, (ev) => {
//   const {resolve, href, empty, port} = ev.detail;

//   let configResolve;
//   const configPromise = new Promise((resolve) => {
//     configResolve = resolve;
//   });

//   ev.preventDefault();

//   if (port) {
//     activePort = port;

//     port.onmessage = (ev) => {
//       if (activePort !== port) {
//         console.warn('got data on inactive port', ev.data);
//         return false;
//       }

//       const {type, payload} = ev.data;
//       switch (type) {
//         case 'ready':
//           configResolve(payload);
//           break;

//         case 'go':
//           santaApp.route = payload;
//           break;

//         case 'play':
//           console.info('play', payload);
//           soundcontroller.play(...payload);
//           break;

//         default:
//           console.warn('unhandled port message', type, payload);
//       }
//     };

//   } else {
//     activePort = null;  // invalidate previous port
//   }

//   // TODO(samthor): This method is a little awkward, but configures whether the error is displayed,
//   // and what it displays (e.g. a locked image).
//   // If `empty` is false, then it actually never shows at all, since the slot is `display: none`.

//   const handler = async () => {
//     const locked = (!href && santaApp.route);
//     error.textContent = '';

//     if (!locked) {
//       error.error = empty && Boolean(href);
//       error.lock = false;

//       if (empty) {
//         chrome.mini = false;
//       } else {
//         // TODO: This is the startup path for valid scenes. It shouldn't be hidden away like this.
//         const config = await configPromise;
//         console.warn('got config', config);
//         chrome.mini = !config.scroll;
//         soundcontroller.transitionTo(config.sound || [], 1.0);
//       }

//       return;
//     }

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


// async function shutdown(control) {
//   for await (const op of control) {
//     // ignore all, can't do anything after shutdown
//     console.debug('ignoring post-shutdown op', op);
//   }
//   console.info('done', control);
// }


// async function runner(control) {
//   for await (const op of control) {
//     if (op === null) {
//       return shutdown(control);
//     }

//     const {type, payload} = op;
//     switch (type) {
//       case 'go':
//         santaApp.route = payload;
//         break;

//       case 'play':
//         soundcontroller.play(...payload);
//         break;

//       case 'score':
//         console.debug('got score', payload);
//         break;

//       default:
//         console.warn('unhandled op', type);
//     }
//   }
// }


// async function *iterator() {
//   let count = 0;
//   for (let i = 0; i < 2; ++i) {
//     await new Promise((r) => window.setTimeout(r, 1000));
//     yield {type: 'score', payload: ++count};
//   }
//   yield null;
//   yield 'whatever';
// }

// const it = iterator();
// console.info(it);
// runner(it);



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
  loader.load(url).then((port) => {
    console.info('loading done with port', port, 'for', url);
  });
};


const {scope, go} = configureProdRouter(loaderScene);
document.body.addEventListener('click', globalClickHandler(scope, go));

