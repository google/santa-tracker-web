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

/**
 * @fileoverview Main entrypoint for Santa Tracker. Runs in the prod domain.
 */

import './src/polyfill/attribute.js';
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
import {localStorage} from './src/storage.js';
import maybeLoadCast from './src/deps/cast.js';
import * as kplay from './src/kplay.js';
import {buildLoader} from './src/core/loader.js';
import {configureProdRouter, globalClickHandler} from './src/core/router.js';
import {sceneImage} from './src/core/assets.js';
import * as promises from './src/lib/promises.js';
import global from './global.js';
import configureCustomKeys from './src/core/keys.js';
import * as firebaseConfig from './src/core/config.js';
import * as common from './src/core/common.js';
import isAndroid from './src/core/android.js';
import {_msg} from './src/magic.js';


window.santaApp = {};


maybeLoadCast();


const noticesElement = document.createElement('div');
noticesElement.className = 'notices';
document.body.append(noticesElement);

if (!isAndroid()) {
  const cookieNoticeElement = document.createElement('santa-notice');
  cookieNoticeElement.key = 'cookie-ok';
  cookieNoticeElement.href = 'https://policies.google.com/technologies/cookies';
  cookieNoticeElement.textContent = _msg`notice_cookies`;
  noticesElement.append(cookieNoticeElement);
}

const upgradeNoticeElement = document.createElement('santa-notice');
upgradeNoticeElement.textContent = _msg`error-out-of-date`;
upgradeNoticeElement.hidden = !firebaseConfig.siteExpired();
firebaseConfig.listen(() => {
  // nb. This has the unfortunate problem of bringing this message back very often, but that's
  // probably fine, since the user is in a very bad state anyway.
  upgradeNoticeElement.hidden = !firebaseConfig.siteExpired();
});
noticesElement.append(upgradeNoticeElement);

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

// nb. This is added only when needed.
const sidebarElement = document.createElement('santa-cardnav');
sidebarElement.setAttribute('slot', 'sidebar');

// Insert on first open. The load is too heavy otherwise.
chromeElement.addEventListener('sidebar-open', (ev) => {
  chromeElement.append(sidebarElement);
}, {once: true});


// Controls configuring Android insets.
(function() {
  if (typeof Android === 'undefined' || !Android.stableInsets) {
    return;
  }
  function refreshInsets() {
    const padding = JSON.parse(Android.stableInsets());
    const [topInset, rightInset, bottomInset, leftInset] = padding;
    const sideInset = Math.max(rightInset, leftInset);
    chromeElement.style.setProperty('--padding-top', topInset + 'px');
    chromeElement.style.setProperty('--padding-side', sideInset + 'px');
  }
  window.addEventListener('resize', refreshInsets);
  refreshInsets();
}());


// Controls the random future games that a user is suggested.
(function() {
  const recentBuffer = 6;
  const displayCardCount = 2;
  const recentRoutes = new Set();

  window.addEventListener('entrypoint-route', (ev) => {
    const route = ev.detail;
    global.setState({route});

    recentRoutes.add(route);
    while (recentRoutes.size >= recentBuffer) {
      for (const key of recentRoutes) {
        recentRoutes.delete(key);
        break;
      }
    }
    updatePlayNextCards(route);
  });

  function updatePlayNextCards(currentRoute) {
    // array of all possible games
    const nav = firebaseConfig.nav().filter((x) => x[0] !== '@' && !firebaseConfig.isLocked(x));

    if (nav.length <= displayCardCount) {
      console.warn('not enough valid nav routes to create cards', nav)
      return;
    }

    // choose games biasing towards start
    const cards = [];
    const attempts = 20;
    let i = 0;
    while (cards.length < displayCardCount) {
      ++i;
      const index = ~~(Math.pow(Math.random(), 4) * nav.length);
      const choice = nav.splice(index, 1)[0];
      if ((recentRoutes.has(choice) || cards.indexOf(choice) !== -1) && i < attempts) {
        continue;
      }
      cards.push(choice);
    }

    scoreOverlayElement.textContent = '';
    cards.forEach((scene) => {
      const card = document.createElement('santa-card');
      card.scene = scene;
      scoreOverlayElement.append(card);
    });

    let playNextRoute = cards[0];

    let featured = firebaseConfig.featuredRoute();
    if (featured === 'takeoff' || featured === 'liftoff') {
      // FIXME: hack for HPP
      featured = 'likealight';
    }

    if (!featured) {
      // Do nothing, no featured.
    } else if (currentRoute === featured) {
      // We just chose this route. Mark it as "done".
      localStorage['featured_played'] = featured;
    } else if (localStorage['featured_played'] !== featured) {
      // This route hasn't yet been played, so make it the Play Next route.
      playNextRoute = featured;
    }

    console.warn('playNext is', playNextRoute);
    global.setState({playNextRoute});
  }
}());


const loadMethod = loaderElement.load.bind(loaderElement);
const {scope, go, write: writeData} = configureProdRouter(buildLoader(loadMethod));
document.body.addEventListener('click', globalClickHandler(scope, go));

const kplayInstance = kplay.prepare();


/**
 * Handles audio.
 */
(function() {
  if (isAndroid()) {
    if (kplayInstance.suspended) {
      kplayInstance.resume();
    }
    chromeElement.muted = undefined;
    global.setState({muted: false});
    kplayInstance.muted = false;
    return;
  }

  // Control `<santa-chrome>` displaying mute or unmute.
  global.subscribe((state) => {
    chromeElement.muted = state.muted;
    kplayInstance.muted = (state.hidden || state.muted);  // mute if in background, or requested
  });

  // Start "muted" if the browser is disallowing audio.
  const initialSuspended = kplayInstance.suspended;
  global.setState({muted: initialSuspended});

  let audioTrigger = 0;

  chromeElement.addEventListener('audio', (ev) => {
    const wasMuted = ev.detail;

    if (kplayInstance.suspended && wasMuted) {
      const localAudioTrigger = audioTrigger;

      // unmute only on resume
      kplayInstance.resume().then(() => {
        // prevent further actions if we muted again
        if (localAudioTrigger === audioTrigger) {
          global.setState({muted: false});
        }
      });
    } else {
      global.setState({muted: !wasMuted});
    }

    ++audioTrigger;
  });
}());


window.addEventListener(common.playEvent, (ev) => kplayInstance.play(...ev.detail));


interludeElement.addEventListener('transition_in', () => {
  kplayInstance.play('menu_transition_game_in');
});
interludeElement.addEventListener('transition_out', () => {
  kplayInstance.play('menu_transition_game_out');
});



scoreOverlayElement.addEventListener('restart', () => global.setState({status: 'restart'}));
scoreOverlayElement.addEventListener('resume', () => global.setState({status: ''}));
scoreOverlayElement.addEventListener('home', () => go(''));


/**
 * Manage singleton element state based on global state. Just updates things like loaders, score
 * overlays and so on.
 */
global.subscribe((state) => {
  // This happens first, as we modify state as a side-effect.
  if (state.status === 'restart') {
    state.status = '';  // nb. modifies state as side effect
    ga('send', 'event', 'game', 'start', state.route);
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
  if (!scoreOverlayElement.hidden) {
    scoreOverlayElement.focus();
  }

  loaderElement.disabled = !playing;                               // paused/disabled
  loaderElement.toggleAttribute('tilt', orientationChangeNeeded);  // pretend to be rotated
  orientationOverlayElement.orientation = orientationChangeNeeded ? state.sceneOrientation : null;
  orientationOverlayElement.hidden = !orientationChangeNeeded;     // show rotate hint
  tutorialOverlayElement.hidden = !playing;                        // hide tutorial w/rotate hint

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

    // TODO(samthor): Cache what we played before.
    if (pause) {
      kplayInstance.play('global_pause');
    } else {
      kplayInstance.play('global_unpause');
    }
  }

  const sound = state.muted ? 'muted' : 'unmuted';
  state.control.send({type: sound});

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


/**
 * Handle preload events from the contained scene. Should not effect global state.
 *
 * @param {!PortControl} control
 * @param {!Object<string, *>} data
 * @return {!Promise<Object<string, *>>}
 */
async function prepare(control, data) {
  const timeoutSymbol = Symbol('timeout');
  const timeoutPromise = promises.timeout(10 * 1000).then(() => timeoutSymbol);

  // nb. This relies on the scene having at least one task, which is enforced in `api.js`.
  const {
    loadedPromise,
    handleTasks,
  } = (function() {
    const {resolve, promise} = promises.resolvable();
    let tasks = 0;

    return {
      loadedPromise: promise,
      handleTasks(delta) {
        tasks += delta;
        if (tasks <= 0) {
          resolve();
        }
      },
    };
  }());

  const {
    configPromise,
    handleConfig,
  } = (function() {
    const {resolve, promise} = promises.resolvable();
    let resolved = false;

    return {
      configPromise: promise,
      handleConfig(config) {
        if (resolved) {
          throw new TypeError('got dup config event');
        }
        resolved = true;

        if (!config.subscribe) {
          // The normal case: the scene just wants params and no subscription.
          control.send({type: 'data', payload: data});
          return resolve(config);
        }

        // If the page wants a subscription, they're listening to the Firebase config data PLUS
        // the page's params (in "data" key). This only happens for modvil.
        const listener = () => {
          if (control.done) {
            firebaseConfig.remove(listener);
            global.unsubscribe(listener);
            return;
          }
          const {playNextRoute, trackerOffset} = global.getState();
          const payload = {
            android: isAndroid(),
            routes: firebaseConfig.routesSnapshot(),
            featured: firebaseConfig.featuredRoute(),
            play: playNextRoute,
            trackerFlags: firebaseConfig.trackerFlags(),
            trackerOffset,
            loudCard: firebaseConfig.loudCard(),
            data,
          };
          control.send({type: 'data', payload});
        };
        global.subscribe(listener);
        firebaseConfig.listen(listener);
        listener();
        return resolve(config);
      },
    };
  }());

  const readySymbol = Symbol('ready');
  const readyPromise = Promise.all([
    loadedPromise,
    configPromise,
  ]).then(() => readySymbol);

  for (;;) {
    const op = await Promise.race([
      timeoutPromise,
      readyPromise,
      control.next(),
    ]);
    if (op === readySymbol) {
      return await configPromise;  // we know config is done
    }
    if (op === timeoutSymbol || op === null) {
      return null;  // generic failure case
    }

    const {type, payload} = op;
    switch (type) {
      case 'tasks':
        handleTasks(payload);
        continue;

      case 'sounds': {
        let previousDone = 0;
        kplayInstance.preload(payload, (done, total) => {
          if (done === 0) {
            handleTasks(total);
          } else {
            handleTasks(previousDone - done);  // -ve tasks
            previousDone = done;
          }
        });
        continue;
      }

      case 'config':
        handleConfig(payload || {});
        continue;

      default:
        console.warn('got unhandled preload', op);
    }
  }
}


/**
 * Run incoming messages from the contained scene.
 *
 * @param {!PortControl} control
 * @param {string} route active
 */
async function runner(control, route) {
  const sc = kplayInstance;
  let recentScore = null;

  // nb. we also call this as a result of 'restart'
  ga('send', 'event', 'game', 'start', route);
  const analyticsLogEnd = () => {
    if (!recentScore) {
      return;
    }
    ga('send', 'event', 'game', 'end', route);
    recentScore.score && ga('send', 'event', 'game', 'score', route, recentScore.score);
    recentScore.level && ga('send', 'event', 'game', 'level', route, recentScore.level);
    recentScore = null;
  };

  for (;;) {
    const op = await control.next();
    if (op === null || op === undefined) {
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
        if (payload && payload.share) {
          const shareUrl = window.location.pathname + window.location.search;
          global.setState({shareUrl})
        }

        global.setState({
          status: 'gameover',
        });
        analyticsLogEnd();
        continue;

      case 'score':
        recentScore = payload;
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

    console.debug('running scene unhandled', op);
  }

  analyticsLogEnd();
}


loaderElement.addEventListener(gameloader.events.load, async (ev) => {
  // Load process is started. This is triggered every time a new call to .load() is made, even if
  // the previous load isn't finished yet. It's suitable for resetting global UI, although there
  // won't be information about the next scene yet.

  // fade out previous scene audio here
  const sc = kplayInstance;
  sc.stopAll(0.2);

  // TODO(samthor): This isn't triggered on initial load.
  interludeElement.show();
  tutorialOverlayElement.reset();
  chromeElement.navOpen = false;

  global.setState({
    control: null,
    sceneHasPause: false,
    score: {},
  });
});


loaderElement.addEventListener(gameloader.events.prepare, (ev) => {
  // A new frame is being loaded. It's not yet visible (although its onload event has fired by now),
  // but the prior frame is now deprecated and is inevitably going to be removed.
  // It's possible that the new frame is null (missing/404/empty): in this case, control is null.

  const {context, control, ready} = ev.detail;
  const call = async () => {
    const {data, route, error, locked} = context;

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
    const config = (await configPromise) || {};  // null if locked
    const lockedImage = await (locked ? sceneImage(route).catch(() => null) : null);
    const sc = kplayInstance;

    // Everything is ready, so inform `santa-gameloader` that we're happy to be swapped in if we
    // are still the active scene.
    if (!ready()) {
      return false;
    }
    document.body.classList.remove('loading');  // hide dots
    control.send({type: 'ready'});
    window.dispatchEvent(new CustomEvent('entrypoint-route', {detail: route}));

    // Go into fullscreen mode on Android, and control orientation lock.
    if (typeof Android !== 'undefined') {
      if (Android.fullscreen) {
        Android.fullscreen(!config.scroll);
      }
      try {
        if (config.orientation === 'portrait') {
          Android.orientationPortrait();
        } else if (config.orientation === 'landscape') {
          Android.orientationLandscape();
        } else {
          Android.orientationUnlock();
        }
      } catch (err) {
        console.warn('could not lock orientation', err);
      }
    }

    // Configure the optional error display.
    let errorCode = null;
    if (error) {
      errorCode = 'internal';
    } else if (locked) {
      // do nothing
    } else if (!control.hasPort) {
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
      sceneTilt: config.tilt || false,
      sceneHasPause: Boolean(config.pause),
      control,
      status: '',
    });
    sc.transitionTo(config.sound || [], 1.0);

    // Kick off runner.
    await runner(control, route);
    // TODO: might be trailing events
  };

  // Run in a safe block that shows an error if something fails.
  (async function() {
    try {
      await call();
    } catch (e) {
      const active = ready();  // nb. call ready() for side-effects, we should finish gameloader
      console.error('error active?', active, e);
      if (!active) {
        return false;  // ... preempted scenes don't show errors
      }
      loaderElement.load(null, {...context, error: e});
    }
  }());
});


configureCustomKeys(loaderElement);


// Support skewing the tracker.
(function() {

  /**
   * Adjust Santa's location between 0-1 along his total route.
   */
  window.santaApp.adjustSanta = (ratio, offset = 0) => {
    const year = new Date().getFullYear();
    const santaStart = +Date.UTC(year, 11, 24, 10, 0, 0);  // 24th Dec at 10:00 UTC
    const flightDuration = 25 * 60 * 60 * 1000;

    const timeUntilStart = santaStart - +new Date();

    const trackerOffset = timeUntilStart + (ratio * flightDuration) + offset;
    console.warn('setting trackerOffset', trackerOffset);

    global.setState({trackerOffset});
  };

}());
