/**
 * @fileoverview Main entrypoint for Santa Tracker. Runs in the prod domain.
 */

import './src/polyfill/css.js';

import './src/elements/santa-chrome.js';
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


const loaderElement = document.createElement('santa-gameloader');
const interludeElement = document.createElement('santa-interlude');
const chromeElement = document.createElement('santa-chrome');
document.body.append(chromeElement, loaderElement, interludeElement);

const tutorialOverlayElement = document.createElement('santa-tutorial');
tutorialOverlayElement.setAttribute('slot', 'overlay');
loaderElement.append(tutorialOverlayElement);

const orientationOverlayElement = document.createElement('santa-orientation');
orientationOverlayElement.setAttribute('slot', 'overlay');
loaderElement.append(orientationOverlayElement);

const badgeElement = document.createElement('santa-badge');
badgeElement.setAttribute('slot', 'game');
chromeElement.append(badgeElement);

// nb. This is added only when needed.
const errorElement = document.createElement('santa-error');

const sidebar = document.createElement('santa-cardnav');
sidebar.hidden = true;
sidebar.setAttribute('slot', 'sidebar');
chromeElement.append(sidebar);


const {scope, go, write: writeData} = configureProdRouter(buildLoader(loaderElement));
document.body.addEventListener('click', globalClickHandler(scope, go));

chromeElement.addEventListener('nav-open', (ev) => {
  sidebar.hidden = false;
});

chromeElement.addEventListener('nav-close', (ev) => {
  sidebar.hidden = true;
});

const kplayReady = kplay.prepare();
kplayReady.then((sc) => {
  let muted = false;

  global.subscribe((state) => {
    const update = state.hidden;
    if (muted !== update) {
      muted = update;

      if (muted) {
        sc.play('global_sound_off');
      } else {
        sc.play('global_sound_on');
      }
    }

    // TODO(samthor): This only shows when the scene is in mini mode.
    chromeElement.unmute = state.audioSuspended;
  });

  if (sc.suspended) {
    global.setState({audioSuspended: true});
    // Show the unmute button while we're suspended. The tab can be unsuspended for a bunch of
    // really unknown reasons.
    sc.resume().then(() => global.setState({audioSuspended: false}));
    chromeElement.addEventListener('unmute', () => {
      sc.resume();
    });
  } else {
    global.setState({audioSuspended: false});
  }
});

const showOverlay = (state={}) => {
  let overlay = document.querySelector('santa-overlay');
  if (!overlay) {
    const endSceneOverlayElement = document.createElement('santa-overlay');
    endSceneOverlayElement.setAttribute('slot', 'overlay');
    document.body.append(endSceneOverlayElement);
    overlay = endSceneOverlayElement;
  }
  overlay.state = state;
  overlay.style.display = 'block';
};

const hideOverlay = () => {
  const overlay = document.querySelector('santa-overlay');
  overlay.style.display = 'none';
};

window.addEventListener('game-restart', (e) => {
  hideOverlay(state);
  global.setState({status: 'restart'})
}, true);

global.subscribe((state) => {
  chromeElement.mini = state.mini;
  tutorialOverlayElement.filter = state.inputMode;

  const gameover = (state.status === 'gameover');
  if (gameover) {
    showOverlay(state);
  }

  // Only if we have an explicit orientation, the scene has one, and they're different.
  const orientationChangeNeeded =
      state.sceneOrientation && state.orientation && state.sceneOrientation !== state.orientation;
  const disabled = gameover || orientationChangeNeeded;

  loaderElement.disabled = disabled;                               // paused/disabled
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

  if (state.status === 'restart') {
    state.status = '';  // nb. modifies state as side effect
    state.control.send({type: 'restart'});
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
  if (!control.hasPort) {
    return {};
  }
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
        console.debug('got preload', (payload * 100).toFixed(2) + '%');
        continue;

      case 'preload':
        const [preloadType, event, port] = payload;
        if (preloadType !== 'sounds') {
          throw new TypeError(`unsupported preload: ${payload[0]}`);
        }
        // TODO: don't preload sounds if the AudioContext is suspended, queue for later.
        const sc = await kplayReady;
        preloads.push(preloadSounds(sc, event, port));
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
 */
async function runner(control) {
  const sc = await kplayReady;

  for (;;) {
    const op = await control.next();
    if (op === null) {
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
        // TODO: log score?
        global.setState({status: 'gameover'});
        continue;

      case 'score':
        global.setState({score: payload});
        continue;

      case 'data':
        // FIXME: This is out of order, writeData is defined below.
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


loaderElement.addEventListener(gameloader.events.load, (ev) => {
  // Load process is started. This is triggered every time a new call to .load() is made, even if
  // the previous load isn't finished yet. It's suitable for resetting global UI, although there
  // won't be information about the next scene yet.
  interludeElement.show();
  chromeElement.navOpen = false;

  global.setState({
    mini: true,
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
    global.setState({
      sceneOrientation: null,
    });

    // Wait for preload (and other tasks) to complete. None of these have effect on global state so
    // only check if we're still the active scene once done.
    const config = await configPromise;
    const lockedImage = await (locked ? sceneImage(route).catch(null) : null);
    const sc = await kplayReady;

    // Everything is ready, so inform `santa-gameloader` that we're happy to be swapped in if we
    // are still the active scene.
    if (!ready()) {
      return false;
    }
    control.send({type: 'ready'});

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
      mini: !config.scroll,
      sceneOrientation: config.orientation || null,
      sceneHasPause: Boolean(config.pause),
      control,
      status: '',
    });
    sc.transitionTo(config.sound || [], 1.0);

    // Kick off runner.
    await runner(control);

    // TODO: might be trailing events
  };

  resolve(call());
});






/**
 * Configures key and gamepad handlers for the host frame.
 */
function configureCustomKeys() {
  const keycodeMap = {
    ' ': 32,
    'PageUp': 33,
    'PageDown': 34,
    'End': 35,
    'Home': 36,
    'Left': 37,
    'Up': 38,
    'Right': 39,
    'Down': 40,
    'ArrowLeft': 37,
    'ArrowUp': 38,
    'ArrowRight': 39,
    'ArrowDown': 40,
  };

  document.body.addEventListener('keydown', (ev) => {
    // Steal gameplay key events from the host frame and focus on the loader. Dispatch a fake event
    // to the scene so that the keyboard feels fluid.
    const code = keycodeMap[ev.key];
    if (!code) {
      return false;  // not part of map, just ignore
    }

    const {control} = global.getState();
    if (control) {
      control.send({type: 'keydown', payload: {key: ev.key, keyCode: code}});
    }
    ev.preventDefault();
    loaderElement.focus();
  });

  // These are vague estimates (in ms) for gamepad emulation. We can't get the system's repeat rate
  // config, short of stealing it when a user presses a key.
  const initialRepeat = 400;
  const followingRepeat = 50;

  const gamepads = {};
  const buttonsActive = {};
  let lastTimestamp = 0;

  /**
   * Queued to trigger repeat keystrokes. Queues another stroke if the control is still active.
   *
   * @param {string} key to repeat send
   */
  function repeatKey(key) {
    const {control, hidden} = global.getState();
    if (!control || hidden) {
      return false;
    }

    // TODO: could be combined with a rAF.
    buttonsActive[key] = window.setTimeout(() => repeatKey(key), followingRepeat);
    const payload = {
      key,
      keyCode: keycodeMap[key],
      repeat: true,
    };
    control.send({type: 'keydown', payload});
  }

  function gamepadLoop() {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3] || null;
    if (!gp) {
      return;
    }
    window.requestAnimationFrame(gamepadLoop);

    // TODO(samthor): We only look at the 1st gamepad. What if we have multiplayer games?
    if (gp.timestamp === lastTimestamp) {
      return;
    }
    lastTimestamp = gp.timestamp;

    const buttonsDown = {};

    const buttonPressed = (index) => (gp.buttons[index] && gp.buttons[index].pressed);
    const enableIfPressed = (index, key) => {
      if (buttonPressed(index)) {
        buttonsDown[key] = true;
      }
    };

    const {control, hidden} = global.getState();
    if (control && !hidden) {
      const threshold = 0.2;

      // ... only look for events if there's something to control and page is visible
      const leftright = gp.axes[0];
      if (leftright < -threshold) {
        buttonsDown['ArrowLeft'] = true;
      } else if (leftright > +threshold) {
        buttonsDown['ArrowRight'] = true;
      }
      const updown = gp.axes[1];
      if (updown < -threshold) {
        buttonsDown['ArrowUp'] = true;
      } else if (updown > +threshold) {
        buttonsDown['ArrowDown'] = true;
      }

      enableIfPressed(0, ' ');
      enableIfPressed(12, 'ArrowUp');
      enableIfPressed(13, 'ArrowDown');
      enableIfPressed(14, 'ArrowLeft');
      enableIfPressed(15, 'ArrowRight');
    }

    for (const key in buttonsDown) {
      if (!(key in buttonsActive)) {
        // Wasn't previously pressed, dispatch keydown.
        const keyCode = keycodeMap[key] || 0;
        control && control.send({type: 'keydown', payload: {key, keyCode, repeat: false}});

        // ... and enqueue repeat
        buttonsActive[key] = window.setTimeout(() => repeatKey(key), initialRepeat);
      }
    }
    for (const key in buttonsActive) {
      if (key in buttonsDown) {
        continue;
      }
      // Was previously pressed, dispatch keyup!
      const keyCode = keycodeMap[key] || 0;
      control && control.send({type: 'keyup', payload: {key, keyCode, repeat: true}});

      // ... and clear repeat timer
      window.clearTimeout(buttonsActive[key]);
      delete buttonsActive[key];
    }
  }

  function gamepadHandler(event) {
    const connecting = event.type === 'gamepadconnected';
    const gamepad = event.gamepad;

    const count = Object.keys(gamepads).length;
    if (connecting) {
      gamepads[gamepad.index] = gamepad;
      if (count === 0) {
        gamepadLoop();  // kick off listener if there are any gamepads
      }
    } else {
      delete gamepads[gamepad.index];
    }
  }

  window.addEventListener('gamepadconnected', gamepadHandler);
  window.addEventListener('gamepaddisconnected', gamepadHandler);
}

configureCustomKeys();