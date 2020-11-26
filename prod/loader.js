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
 * @fileoverview Loader code for Santa Tracker. Adds a <script ...> pointing to the entrypoint.
 *
 * This is transpiled down to ES5-compatible code before being run. It should not use modern
 * library code, like `Promise`, until the support library is loaded.
 */

import config from './src/:config.json';
import checkFallback from './src/fallback.js';
import * as load from './src/load.js';
import {initialize} from './src/firebase.js';
import onInteractive from './src/interactive.js';
import isAndroidTWA from './src/android-twa.js';

window.santaConfig = config;

// In prod, the documentElement has `lang="en"` or similar.
const documentLang = document.documentElement.lang || null;
const isProd = (documentLang !== null);
const fallback = checkFallback() || (location.search || '').match(/\bfallback=.*?\b/);
const ignoreErrors = (location.search || '').match(/\bignore=.*?\b/);
console.info('Santa Tracker', config.version, documentLang, fallback ? '(fallback)' : '');

// Global error handler. Redirect if we fail to load the entrypoint.
let loaded = false;
window.onerror = (msg, file, line, col, error) => {
  console.error('error (loaded=' + loaded + ')', msg, file, line, col, error);
  if (location.hostname === 'santatracker.google.com' && !loaded && !ignoreErrors) {
    window.location.href = 'error.html';
  }
};
window.onunhandledrejection = (event) => {
  console.warn('rejection (loaded=' + loaded + ')', event.reason);
  if (location.hostname === 'santatracker.google.com' && !loaded && !ignoreErrors) {
    window.location.href = 'error.html';
  }
};

// Add this early. We get it very aggressively from Chrome and friends.
window.installEvent = null;
window.addEventListener('beforeinstallprompt', (event) => {
  window.installEvent = event;
});

window.sw = null;
let hasInstalledServiceWorker = false;

if ('serviceWorker' in navigator) {
  // Register the SW in the served language, not the request language (as this isn't available
  // on the naked domain anyway).
  const params = new URLSearchParams();
  if (isProd) {
    params.set('baseurl', config.baseurl);
  }
  window.sw = navigator.serviceWorker.register(`/sw.js?${params.toString()}`).catch((err) => {
    console.warn('sw failed to register', err);
    return null;
  });
  hasInstalledServiceWorker = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    loaded = true;  // pretend that we're loaded, so that Safari doesn't send us to an error page
    window.location.reload();
  });
}


// Load support code for fallback browsers like IE11, non-Chromium Edge, and friends. This is
// needed before using Firebase, as it requires Promise and fetch. This always uses the deployed
// static version, as we only potentially replace it below after Firebase is ready.
if (fallback && isProd) {
  load.supportScripts([
    config.staticScope + 'support.js',
    config.staticScope + 'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
  ], () => {
    WebComponents.waitFor(() => {
      onInteractive(startup);  // should be past DOMContentLoaded now
    });
  });
} else {
  onInteractive(startup);
}


function sanitizeStaticScope(arg) {
  const staticScopeUrl = new URL(arg, window.location);
  if (!staticScopeUrl.pathname.match(/\/$/)) {
    staticScopeUrl.pathname += '/';
  }
  return staticScopeUrl.toString();
}


function startup() {
  // Check Android TWA, but force it if the "?android=1" param is set.
  const startParams = new URLSearchParams(window.location.search);
  isAndroidTWA(startParams.has('android'));

  // Wait for both Firebase Remote Config and the Service Worker (optional), then load entrypoint.
  // This is racey in that a Service Worker change might trigger a reload.
  const ready = Promise.all([initialize(), window.sw]);
  ready.then(([remoteConfig, registration]) => {
    if (remoteConfig.getBoolean('switchOff')) {
      throw new Error('switchOff');
    }

    // Allow Firebase force or optional ?static=... for new releases.
    const forceStaticScope = remoteConfig.getString('staticScope') || null;
    if (forceStaticScope) {
      if (!isProd) {
        // This arguably makes no sense here, as the files probably have the wrong suffix (i18n),
        // and you control your own dev environment.
        console.warn('ignoring custom static scope for dev', forceStaticScope);
      } else {
        console.warn('using custom static scope', forceStaticScope);
        try {
          config.staticScope = sanitizeStaticScope(forceStaticScope);
        } catch (e) {
          // don't set an invalid URL
        }
      }
    }

    document.body.setAttribute('static', config.staticScope);

    // Load entrypoint.
    const entrypoint = config.staticScope + (fallback ? 'fallback' : 'entrypoint') + (isProd ? '_' + documentLang : '') + '.js';
    return load.script(entrypoint, fallback && isProd ? '' : 'module').then(() => {
      loaded = true;
    });
  });
}
