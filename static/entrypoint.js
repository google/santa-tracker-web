/**
 * @fileoverview Main entrypoint for Santa Tracker. Runs in the prod domain.
 */

import './src/polyfill/css.js';
import styles from './styles/santa.css';

document.adoptedStyleSheets = [styles];

import './src/elements/santa-chrome.js';
import './src/elements/santa-notice.js';
import './src/elements/santa-countdown.js';
import * as gameloader from './src/elements/santa-gameloader.js';
import './src/elements/santa-error.js';
import './src/elements/santa-badge.js';
import './src/elements/santa-notice.js';
import './src/elements/santa-overlay.js';
import './src/elements/santa-cardnav.js';
import './src/elements/santa-tutorial.js';
import './src/elements/santa-orientation.js';
import './src/elements/santa-interlude.js';
import * as kplay from './src/kplay.js';
import {buildLoader} from './src/core/loader.js';
import {configureProdRouter, globalClickHandler} from './src/core/router.js';
import {sceneImage} from './src/core/assets.js';
import * as promises from './src/lib/promises.js';
import global from './global.js';
import configureCustomKeys from './src/core/keys.js';


const noticeElement = document.createElement('santa-notice');
document.body.append(noticeElement);


const loaderElement = document.createElement('santa-gameloader');
const interludeElement = document.createElement('santa-interlude');
const chromeElement = document.createElement('santa-chrome');
const scoreOverlayElement = document.createElement('santa-overlay');
scoreOverlayElement.setAttribute('slot', 'overlay');

interludeElement.active = true;  // must show before appending
interludeElement.addEventListener('gone', () => {
  document.body.classList.add('loaded');  // first game has loaded, clear
}, {once: true});

document.body.append(chromeElement, loaderElement, interludeElement);

const tutorialOverlayElement = document.createElement('santa-tutorial');
tutorialOverlayElement.setAttribute('slot', 'overlay');
loaderElement.append(tutorialOverlayElement);

const orientationOverlayElement = document.createElement('santa-orientation');
orientationOverlayElement.setAttribute('slot', 'overlay');
loaderElement.append(orientationOverlayElement, scoreOverlayElement);

const badgeElement = document.createElement('santa-badge');
badgeElement.setAttribute('slot', 'game');
chromeElement.append(badgeElement);

// nb. This is added only when needed.
const errorElement = document.createElement('santa-error');

const sidebar = document.createElement('santa-cardnav');
sidebar.setAttribute('slot', 'sidebar');
chromeElement.append(sidebar);


window.addEventListener('loader-route', (ev) => {
  const route = ev.detail;
  global.setState({route});
});


const {scope, go, write: writeData} = configureProdRouter(buildLoader(loaderElement));
document.body.addEventListener('click', globalClickHandler(scope, go));

const kplayInstance = kplay.prepare();

chromeElement.addEventListener('nav-open', (ev) => {
  sidebar.hidden = false;

  kplayInstance.play('nav_open');

});

chromeElement.addEventListener('nav-close', (ev) => {
  sidebar.hidden = true;

  kplayInstance.play('nav_close');

});



let muted = false;

global.subscribe((state) => {
  const update = state.hidden;
  if (muted !== update) {
    muted = update;

    if (muted) {
      kplayInstance.play('global_sound_off');
    } else {
      kplayInstance.play('global_sound_on');
    }
  }

  // TODO(samthor): This only shows when the scene is in mini mode.
  chromeElement.unmute = state.audioSuspended;
});

if (kplayInstance.suspended) {
  global.setState({audioSuspended: true});
  // Show the unmute button while we're suspended. The tab can be unsuspended for a bunch of
  // really unknown reasons.
  kplayInstance.resume().then(() => global.setState({audioSuspended: false}));
  chromeElement.addEventListener('unmute', () => {
    kplayInstance.resume();
  });
} else {
  global.setState({audioSuspended: false});
}

interludeElement.addEventListener('transition_in', () => {
  kplayInstance.play('menu_transition_game_in');
});
interludeElement.addEventListener('transition_out', () => {
  kplayInstance.play('menu_transition_game_out');
});
  



scoreOverlayElement.addEventListener('restart', () => global.setState({status: 'restart'}));
scoreOverlayElement.addEventListener('resume', () => global.setState({status: ''}));
scoreOverlayElement.addEventListener('home', () => go(''));


// FIXME(samthor): Demo of "advertising cards" at the end of a game. Choose actual games.
const cards = ['snowball', 'codeboogie'];
cards.forEach((scene) => {
  const card = document.createElement('santa-card');
  card.scene = scene;
  scoreOverlayElement.append(card);
});


global.subscribe((state) => {
  // This happens first, as we modify state as a side-effect.
  if (state.status === 'restart') {
    state.status = '';  // nb. modifies state as side effect
    state.control.send({type: 'restart'});
  }

  tutorialOverlayElement.filter = state.inputMode;

  // Configure whether the menubar opens nav, or goes home. Display if we're on the top-level route
  // and the control channel is available (scene ready).
  chromeElement.showHome = (state.route !== '' || !state.control);

  // Only if we have an explicit orientation, the scene has one, and they're different.
  const orientationChangeNeeded =
      state.sceneOrientation && state.orientation && state.sceneOrientation !== state.orientation;

  const gameover = (state.status === 'gameover');
  const playing = (state.status === '' && !orientationChangeNeeded);

  // Configure whether the overlay is hidden.
  scoreOverlayElement.hidden = (state.status === '') || orientationChangeNeeded;
  scoreOverlayElement.isPaused = (!gameover && state.sceneHasPause);
  scoreOverlayElement.shareUrl = state.shareUrl;

  loaderElement.disabled = !playing;                               // paused/disabled
  loaderElement.toggleAttribute('tilt', orientationChangeNeeded);  // pretend to be rotated
  orientationOverlayElement.orientation = orientationChangeNeeded ? state.sceneOrientation : null;
  orientationOverlayElement.hidden = !orientationChangeNeeded;     // show rotate hint
  tutorialOverlayElement.hidden = orientationChangeNeeded;         // hide tutorial w/rotate hint

  let hasScore = false;
  const score = {
    level: 0,
    maxLevel: 0,
    score: 0,
    time: 0,
  };
  if (state.control) {
    for (const key in score) {
      if (key in state.score) {
        score[key] = state.score[key];
        hasScore = true;
      }
    }
  }
  Object.assign(badgeElement, score);
  chromeElement.hasScore = hasScore;

  if (!state.control) {
    chromeElement.action = null;
    return false;
  }

  let pause = false;
  if (!gameover) {
    // ... don't pause/resume the scene if it's marked gameover
    pause = pause || orientationChangeNeeded || state.hidden || state.status === 'paused';
    const type = pause ? 'pause' : 'resume';
    state.control.send({type});
  }

  let action = null;
  if (orientationChangeNeeded) {
    // do nothing
  } else if (gameover) {
    action = 'restart';
  } else if (state.sceneHasPause) {
    if (state.status === 'paused') {
      action = 'play';
    } else {
      action = 'pause';
    }
  }
  chromeElement.action = action;
});


chromeElement.addEventListener('action', (ev) => {
  let status = '';

  switch (ev.detail) {
    case 'play':
      break;

    case 'pause':
      status = 'paused';
      break;

    case 'restart':
      status = 'restart';
      break;

    default:
      return false;
  }

  global.setState({status});
});


async function preloadSounds(sc, event, port) {
  await sc.preload(event, (done, total) => {
    port.postMessage({done, total});
  });
  port.postMessage(null);
}


/**
 * Handle preload events from the contained scene. Should not effect global state.
 *
 * @param {!PortControl} control
 * @param {!Object<string, string>} data
 * @return {!Promise<Object<string, *>>}
 */
async function prepare(control, data) {
  const timeout = promises.timeoutRace(10 * 1000);

  control.send({type: 'data', payload: data});

  const preloads = [];
  const config = {};
outer:
  for (;;) {
    const op = await timeout(control.next());
    if (op === null) {
      break;  // closed or timeout, bail out
    }

    const {type, payload} = op;
    switch (type) {
      case 'error':
        return Promise.reject(payload);

      case 'progress':
        interludeElement.progress = payload;
        continue;

      case 'preload':
        const [preloadType, event, port] = payload;
        if (preloadType !== 'sounds') {
          throw new TypeError(`unsupported preload: ${payload[0]}`);
        }
        // TODO: don't preload sounds if the AudioContext is suspended, queue for later.
        preloads.push(preloadSounds(kplayInstance, event, port));
        continue;

      case 'loaded':
        await timeout(Promise.all(preloads));
        Object.assign(config, payload);
        break outer;
    }

    console.warn('got unhandled preload', op);
  }

  return config;
}


/**
 * Run incoming messages from the contained scene.
 *
 * @param {!PortControl} control
 * @param {string} route active
 */
async function runner(control, route) {
  const sc = kplayInstance;

  // TODO: this should be on global state as the player might restart multiple times
  // const start = performance.now();
  // ga('send', 'event', 'game', 'start', route);

  for (;;) {
    const op = await control.next();
    if (op === null) {
      // TODO(samthor): Can't log score here, state is already reset.
      break;
    }

    const {type, payload} = op;
    switch (type) {
      case 'error':
        throw new Error(payload);

      case 'play':
        sc.play(...payload);
        continue;

      case 'ga':
        ga.apply(null, payload);
        continue;

      case 'go':
        go(payload);
        continue;

      case 'gameover':
        console.info('got gameover call');
        if (payload.share) {
          const shareUrl = window.location.pathname + window.location.search;
          global.setState({shareUrl})
        }

        // TODO: log score?

        global.setState({
          status: 'gameover',
        });
        const {score} = global.getState();

        ga('send', 'event', 'game', 'end', route);
        score.score && ga('send', 'event', 'game', 'score', route, score.score);
        score.level && ga('send', 'event', 'game', 'level', route, score.level);

        continue;

      case 'score':
        global.setState({score: payload});
        continue;

      case 'data':
        writeData(payload);
        continue;

      case 'tutorial-queue':
        tutorialOverlayElement.queue(...payload);
        continue;

      case 'tutorial-dismiss':
        tutorialOverlayElement.dismiss(...payload);
        continue;
    }

    console.debug('running scene got', op);
  }
}


loaderElement.addEventListener(gameloader.events.load, async (ev) => {
  // Load process is started. This is triggered every time a new call to .load() is made, even if
  // the previous load isn't finished yet. It's suitable for resetting global UI, although there
  // won't be information about the next scene yet.

  // fade out previous scene audio here
  const sc = kplayInstance;
  sc.transitionTo([], 0.2);

  // TODO(samthor): This isn't triggered on initial load.
  interludeElement.show();
  chromeElement.navOpen = false;

  global.setState({
    control: null,
    sceneHasPause: false,
    score: {},
  });
});


loaderElement.addEventListener(gameloader.events.error, (ev) => {
  // TODO(samthor): Internal errors could cause an infinite loop here.
  const {error, context} = ev.detail;
  const {route} = context;
  loaderElement.load(null, {error, route});
});


loaderElement.addEventListener(gameloader.events.prepare, (ev) => {
  // A new frame is being loaded. It's not yet visible (although its onload event has fired by now),
  // but the prior frame is now deprecated and is inevitably going to be removed.
  // It's possible that the new frame is null (missing/404/empty): in this case, control is null.

  const {context, resolve, control, ready} = ev.detail;
  const call = async () => {
    const {data, route, error, locked} = context;
    if (error) {
      console.error('error', error);
    }

    // Kick off the preload for this scene and wait for the interlude to appear.
    const configPromise = prepare(control, data);
    document.body.classList.add('loading');  // show dots after a time
    await interludeElement.show();

    if (!control.isAttached) {
      return false;  // replaced during interlude
    }

    // Clear any previous errors.
    errorElement.remove();
    errorElement.textContent = '';

    // The interlude is fully visible, so we can purge the old scene (although this is optional as
    // `santa-gameloader` will always do this for us _anyway_).
    loaderElement.purge();

    // Write some more global state that's nice to clear mid-interlude.
    global.setState({
      sceneOrientation: null,
      shareUrl: null,
    });

    // Wait for preload (and other tasks) to complete. None of these have effect on global state so
    // only check if we're still the active scene once done.
    const config = await configPromise;
    const lockedImage = await (locked ? sceneImage(route).catch(null) : null);
    const sc = kplayInstance;

    // Everything is ready, so inform `santa-gameloader` that we're happy to be swapped in if we
    // are still the active scene.
    if (!ready()) {
      return false;
    }
    document.body.classList.remove('loading');  // hide dots
    control.send({type: 'ready'});

    // Go into fullscreen mode on Android.
    if (typeof Android !== 'undefined' && Android.fullscreen) {
      Android.fullscreen(!config.scroll);
    }

    // Configure the optional error display.
    let errorCode = null;
    if (error) {
      errorCode = 'internal';
    } else if (locked) {
      // do nothing
    } else if (!control.hasPort && route) {
      errorCode = 'missing';
    }
    if (errorCode || locked) {
      errorElement.code = errorCode;
      errorElement.locked = locked;
      if (lockedImage) {
        lockedImage.setAttribute('slot', 'icon');
        errorElement.append(lockedImage);
      }
      loaderElement.append(errorElement);
    }

    // Run configuration tasks and remove the interlude.
    interludeElement.removeAttribute('active');

    global.setState({
      sceneOrientation: config.orientation || null,
      sceneHasPause: Boolean(config.pause),
      control,
      status: '',
    });
    sc.transitionTo(config.sound || [], 1.0);

    // Kick off runner.
    await runner(control, route);

    // TODO: might be trailing events
  };

  resolve(call());
});


configureCustomKeys(loaderElement);