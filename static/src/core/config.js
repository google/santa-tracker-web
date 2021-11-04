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
 * @fileoverview Provides Firebase Remote config. This has side-effects.
 *
 * This should only run on the prod domain. This assumes that "firebase" is a global already
 * available in the global scope.
 */

import {frame} from '../lib/promises.js';
import {localStorage} from '../storage.js';

const firebase = window.firebase;
const remoteConfig = firebase.remoteConfig();
const listeners = new Set();

const memoized = {
  'videos': [],
  'sceneLock': {},
  'sceneRedirect': {},
  'nav': [],
  'featured': {},
};

const isProd = (window.location.hostname === 'santatracker.google.com');
let isOutOfDate = false;


/**
 * @return {boolean} whether the site is out of date and needs a reload
 */
export function siteExpired() {
  return isOutOfDate;
}



function checkUpgrade() {
  const siteVersion = window.santaConfig.version;
  const upgradeToVersion = remoteConfig.getString('upgradeToVersion');
  if (!upgradeToVersion || upgradeToVersion < siteVersion) {
    isOutOfDate = false;
    delete localStorage['upgradeToVersion'];
    return;  // nothing to do
  }

  // otherwise, reload or complain
  console.warn('got out-of-date version, have', siteVersion, 'want', upgradeToVersion);
  if (!isProd || localStorage['upgradeToVersion'] === upgradeToVersion) {
    ga('send', 'event', 'site', 'upgrade-warn', upgradeToVersion);
    isOutOfDate = true;
    notifyListeners();
  } else {
    ga('send', 'event', 'site', 'upgrade-attempt', upgradeToVersion);
    localStorage['upgradeToVersion'] = upgradeToVersion;
    window.location.href = window.location.href;
  }

}
checkUpgrade();
window._check = checkUpgrade;


function refreshMemoized() {
  for (const key in memoized) {
    let cand;
    try {
      cand = JSON.parse(remoteConfig.getString(key));
    } catch (e) {
      continue;  // do nothing
    }
    memoized[key] = Object.freeze(cand);
  }
}
refreshMemoized();


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
 * @param {function(!Object): void} callback
 */
export function listen(callback) {
  listeners.add(callback);
}


/**
 * Removes a listener from the config.
 *
 * @param {function(!Object): void)} callback
 */
export function remove(callback) {
  listeners.delete(callback);
}


/**
 * Notify all listeners that something has changed.
 */
function notifyListeners() {
  const nonce = new Object();
  listeners.forEach((listener) => {
    Promise.resolve().then(() => listener(nonce));
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
  refreshMemoized();
  checkUpgrade();

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
 * @return {?string} today's featured route
 */
export function featuredRoute() {
  const today = new Date();
  if (today.getMonth() !== 11) {
    return null;
  }
  return memoized.featured[`${today.getDate()}`] || null;
}


/**
 * @return {!Object} misc tracker flags, subset of Firebase config
 */
export function trackerFlags() {
  return {
    routeUrl: remoteConfig.getString('routeUrl'),
    showTracker: remoteConfig.getBoolean('showTracker'),
    useGeoIP: remoteConfig.getBoolean('useGeoIP'),
    routeJitter: remoteConfig.getNumber('routeJitter'),
  };
}


/**
 * @return {string} featureCard
 */
export function loudCard() {
  return remoteConfig.getString('loudCard');
}


/**
 * @param {?string} route to check
 * @param {boolean} fallback whether we are fallback mode
 * @return {?string} route to serve
 */
export function sceneForRoute(route, fallback) {
  if (!route || route === 'index') {
    return indexScene(fallback);
  }

  // Actually lock scenes in prod.
  if (isLocked(route)) {
    if (isProd) {
      return null;
    }
    console.debug('failing open for scene locked in prod', route);
  }

  const v = videos();
  if (v.indexOf(route) !== -1) {
    return 'video';
  }
  return route;
}


/**
 * @param {string} route to redirect
 * @return {string|undefined} optional updated route
 */
export function redirectRoute(route) {
  if (route in memoized.sceneRedirect) {
    return memoized.sceneRedirect[route];
  }
  if (route === 'index') {
    return '';
  }
}


/**
 * @return {!Array<string>} video IDs
 */
export function videos() {
  return memoized.videos;
}


/**
 * @return {!Array<string>} nav bar scene contents
 */
export function nav() {
  return memoized.nav;
}


/**
 * @param {string} route to check if locked
 * @return {boolean} if locked
 */
export function isLocked(route) {
  const {sceneLock} = memoized;

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


export function routesSnapshot() {
  const {sceneLock, videos} = memoized;
  const out = {};
  for (const route in sceneLock) {
    out[route] = {
      locked: lockedTo(route),
      video: false,
    };
  }
  videos.forEach((video) => {
    if (!(video in out)) {
      out[video] = {
        locked: undefined,
      };
    }
    out[video].video = true;
  });
  return out;
}


/**
 * @param {string} route to return date locked until
 * @return {number|undefined} date within Dec locked until (0 for always)
 */
export function lockedTo(route) {
  if (!isLocked(route)) {
    return undefined;
  }

  const {sceneLock} = memoized;
  return sceneLock[route];
}


/**
 * @param {boolean} fallback whether to show old codebase
 * @return {string} the scene to show for "/" or "index"
 */
export function indexScene(fallback) {
  return remoteConfig.getString(fallback ? 'fallbackIndexScene' : 'indexScene') || 'index';
}
