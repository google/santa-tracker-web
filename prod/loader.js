/**
 * @fileoverview Loader code for Santa Tracker. Adds a <script ...> pointing to the entrypoint.
 *
 * This is transpiled down to ES5-compatible code before being run. It should not use modern
 * library code, like `Promise`, until the support library is loaded.
 */

import config from './config.json';
import checkFallback from './src/fallback.js';
import * as load from './src/load.js';
import {initialize} from './src/firebase.js';
import isAndroidTWA from './src/android-twa.js';

// In prod, the documentElement has `lang="en"` or similar.
const documentLang = document.documentElement.lang || null;
const isProd = (documentLang !== null);
const fallback = checkFallback() || (location.search || '').match(/\bfallback=.*?\b/);
console.info('Santa Tracker', config.version, documentLang, fallback ? '(fallback)' : '');

// Global error handler. Redirect if we fail to load the entrypoint.
let loaded = false;
window.onerror = (msg, file, line, col, error) => {
  console.error('error (loaded=' + loaded + ')', msg, file, line, col, error);
  if (location.hostname === 'santatracker.google.com' && !loaded) {
    window.location.href = 'error.html';
  }
};
window.onunhandledrejection = (event) => {
  console.warn('rejection (loaded=' + loaded + ')', event.reason);
  if (location.hostname === 'santatracker.google.com' && !loaded) {
    window.location.href = 'error.html';
  }
};

if ('serviceWorker' in navigator) {
  // Register the SW in the served language, not the request language (as this isn't available
  // on the naked domain anyway).
  if (true || isProd) {
    window.sw = navigator.serviceWorker.register(`/sw.js?lang=${documentLang}`);
    window.sw.then((resp) => {
      console.info('sw registered', resp);
    }).catch((err) => {
      console.info('sw failed');
    });
  } else {
    window.sw = null;
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
}

function onInteractive(fn) {
  if (document.readyState === 'interactive') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', () => fn());
  }
}

// Load support code for fallback browsers like IE11, non-Chromium Edge, and friends. This is
// needed before using Firebase, as it requires Promise and fetch.
if (fallback && isProd) {
  load.supportScripts([
// FIXME: Removed because Edge-etc should never need these.
//    config.staticScope + 'node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
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

function startup() {
  const startParams = new URLSearchParams(window.location.search);

  // Check Android TWA, but force it if the "?android=1" param is set.
  isAndroidTWA(startParams.has('android'));

  // Wait for the first Firebase Remote config response and then load our entrypoint.
  initialize().then((remoteConfig) => {
    if (remoteConfig.getBoolean('switchOff')) {
      throw new Error('switchOff');
    }

    // Allow optional ?static=... for testing new releases.
    if (startParams.has('static')) {
      const staticScopeUrl = new URL(startParams.get('static'), window.location);
      if (!staticScopeUrl.pathname.match(/\/$/)) {
        staticScopeUrl.pathname += '/';
      }
      config.staticScope = staticScopeUrl.toString();
    }
    document.body.setAttribute('static', config.staticScope);

    // Load entrypoint.
    const entrypoint = config.staticScope + (fallback ? 'fallback' : 'entrypoint') + (isProd ? '_' + documentLang : '') + '.js';
    return load.script(entrypoint, fallback && isProd ? '' : 'module').then(() => {
      loaded = true;
    });
  });
}
