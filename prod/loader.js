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
  if (isProd && !loaded) {
    window.location.href = 'error.html';
  }
};
window.onunhandledrejection = (event) => {
  if (isProd && !loaded) {
    console.warn('rejection (loaded=' + loaded + ')', event.reason);
    window.location.href = 'error.html';
  }
};

// Load support code for fallback browsers like IE11, non-Chromium Edge, and friends. This is
// needed before using Firebase, as it requires Promise and fetch.
if (fallback && isProd) {
  load.supportScripts([
    config.staticScope + 'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
    config.staticScope + 'support.js',
  ], startup);
} else {
  startup();  // or just continue immediately
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
