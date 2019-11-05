/**
 * @fileoverview Provides Firebase Remote config. This has side-effects.
 *
 * This should only run on the prod domain. This assumes that "firebase" is a global already
 * available in the global scope.
 */

import {frame} from '../lib/promises.js';

const firebase = window.firebase;
const remoteConfig = firebase.remoteConfig();
const listeners = new Set();

function expontentialDelay(range, failures = 0) {
  return Math.pow(1.0 + (range * Math.random()), failures + 1) - (range / 2);
}

/*
 * Queues up a refresh every 'refreshEvery' time.
 */
(function() {
  let failedRefreshCount = 0;
  let refreshTimeout = 0;

  async function runRefresh() {
    try {
      await refresh();
      failedRefreshCount = 0;
    } catch (e) {
      ++failedRefreshCount;
      console.warn('failed to refresh Remote Config', err);
    }
    queueRefresh();
  }

  function queueRefresh() {
    // For sanity, ensure that refresh only happens every 60 seconds.
    const refreshEveryMinimum = 60;
    const seconds = Math.max(refreshEveryMinimum, remoteConfig.getNumber('refreshEvery') || 0);

    const delay = 1000 * seconds * expontentialDelay(0.2, failedRefreshCount);
    window.clearTimeout(refreshTimeout);

    // Values become "invalid" after half this time. This probably doesn't matter because we're not
    // triggering a fetch anywhere else?
    remoteConfig.settings.minimumFetchIntervalMillis = delay / 2;

    // Delay by ~seconds +/- 10%, but only enact a new fetch if the window is in the foreground.
    const localTimeout = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        if (localTimeout !== refreshTimeout) {
          return;  // preempted before rAF occurred
        }
        runRefresh();
      });
    }, delay);
    refreshTimeout = localTimeout;
  }

  queueRefresh();
})();


/**
 * Adds a listener to the config.
 *
 * @param {function(): void} callback
 */
export function listen(callback) {
  listeners.add(callback);
}


/**
 * Notify all listeners that something has changed.
 */
function notifyListeners() {
  listeners.forEach((listener) => {
    Promise.resolve().then(() => listener());
  });
}


/**
 * Notifies all listeners on local device date change. Useful for locking or unlocking scenes.
 */
(function() {
  let previousDate = (new Date()).toDateString();

  function checkDate() {
    // check every ~minute on rAF
    const next = 60 * 1000 * expontentialDelay(0.2);
    frame(next).then(checkDate);

    const currentDate = (new Date()).toDateString();
    if (currentDate !== previousDate) {
      previousDate = currentDate;
      notifyListeners();
    }
  }

  checkDate();
})();

/**
 * Performs a refresh of Remote Config. This might be a no-op if the values are yet to be marked
 * invalid.
 *
 * @param {boolean=} invalidateNow whether to invalidate all values immediately
 * @return {!Promise<!Object<string, *>>}
 */
export async function refresh(invalidateNow = false) {
  if (invalidateNow) {
    remoteConfig.settings.minimumFetchIntervalMillis = 0;
  }

  await remoteConfig.fetchAndActivate();

  // nb. It's not clear RC tells us if it changes or not. Just notify everyone anyway.
  notifyListeners();

  return values();
}


/**
 * @return {!Object<string, *>}
 */
export function values() {
  return remoteConfig.getAll();
}


/**
 * @return {boolean} whether to switch off and load an error page.
 */
export function switchOff() {
  return remoteConfig.getBoolean('switchOff');
}


/**
 * @param {?string} route to check
 * @return {?string} route to serve
 */
export function sceneForRoute(route) {
  if (!route || route === 'index') {
    return indexScene();
  } else if (isLocked(route)) {
    return null;
  }
  const v = videos();
  if (v.indexOf(route) !== -1) {
    return 'video';
  }
  return route;
}


/**
 * @return {!Array<string>} video IDs
 */
export function videos() {
  let videos = [];
  try {
    videos = JSON.parse(remoteConfig.getString('videos'))
  } catch (e) {
    // ignore
  }
  return videos;
}


/**
 * @param {string} route to check if locked
 * @return {boolean} if locked
 */
export function isLocked(route) {
  let sceneLock = {};
  try {
    sceneLock = JSON.parse(remoteConfig.getString('sceneLock'))
  } catch (e) {
    // ignore
  }
  if (!(route in sceneLock)) {
    return false;
  }

  const value = sceneLock[route];
  if (!value) {
    return true;  // always locked
  }
  const today = new Date();
  if (today.getMonth() === 10) {
    return true;  // locked throughout Nov
  } else if (today.getMonth() !== 11) {
    return false;  // nothing locked outside Nov-Dec
  }
  return value > today.getDate();
}


/**
 * @return {string} the scene to show for "/" or "index"
 */
export function indexScene() {
  return remoteConfig.getString('indexScene') || 'index';
}
