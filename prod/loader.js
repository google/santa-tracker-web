/**
 * @fileoverview Loader code for Santa Tracker. Adds a <script ...> pointing to the entrypoint.
 *
 * This is transpiled down to ES5-compatible code before being run. It should not use modern
 * library code, like `Promise`, until the support library is loaded.
 */

import config from './src/config.js';  // has side-effects for webcomponents-loader.js
import '@webcomponents/webcomponentsjs/webcomponents-loader.js';
import checkFallback from './src/fallback.js';
import * as load from './src/load.js';
import {initialize} from './src/firebase.js';

// In prod, the documentElement has `lang="en"` or similar.
var documentLang = document.documentElement.lang || null;
var isProd = (documentLang !== null);
var fallback = checkFallback();
console.info('Santa Tracker', config.version, documentLang, fallback ? '(fallback)' : '');

// Global error handler. Redirect if we fail to load the entrypoint.
var loaded = false;
window.onerror = function (msg, file, line, col, error) {
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
}

// Synchonously block to load support code for fallback browsers like IE11 and friends. This is
// needed before Firestore as it uses Promise and fetch.
if (fallback && isProd) {
  var support = document.createElement('script');
  support.src = config.staticScope + 'support.js';
  document.write(support.outerHTML);
}

function loadEntrypoint() {
  // Allow optional ?static=... for testing new releases.
  var p = new URLSearchParams(window.location.search);
  if (p.has('static')) {
    var staticScopeUrl = new URL(p.get('static'), window.location);
    if (!staticScopeUrl.pathname.match(/\/$/)) {
      staticScopeUrl.pathname += '/';
    }
    config.staticScope = staticScopeUrl.toString();
  }
  // Force fallback for modern browsers.
  if (p.has('fallback')) {
    fallback = true;
  }
  document.body.setAttribute('static', config.staticScope);

  // Load entrypoint.
  var entrypoint = config.staticScope + (fallback ? 'fallback' : 'entrypoint') + (isProd ? '_' + documentLang : '') + '.js';
  console.warn('loading entrypoint (or support)?', entrypoint);
  return load.script(entrypoint, fallback && isProd ? '' : 'module').then(function() {
    loaded = true;
    document.body.classList.remove('loading');
  });
}

// Wait for the first Firebase Remote config response and then load our entrypoint.
initialize().then(function(payload) {
  console.debug('got payload', payload, payload['switchOff'].asBoolean());

  let switchOff = false;
  try {
    switchOff = payload['switchOff'].asBoolean();
  } catch (e) {
  }
  if (switchOff) {
    throw new Error('switchOff');
  }

  // nb. WebComponents is probably loaded sync (since it's inlined) but use waitFor anyway (safe).
  WebComponents.waitFor(loadEntrypoint);
});
