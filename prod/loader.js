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

// In prod, the documentElement has `lang="en"` or similar.
var documentLang = document.documentElement.lang || null;
var isProd = (documentLang !== null);
var fallback = checkFallback();
console.info('Santa Tracker', config.version, documentLang, fallback ? '(fallback)' : '');

// Global error handler. Redirect if we fail to load the entrypoint.
var loaded = false;
window.onerror = function (msg, file, line, col, error) {
  if (isProd && !loaded) {
//    window.location.href = 'error.html';
  }
  console.warn('error', msg, file, line, col, error);
};

// Synchonously block to load support code for fallback browsers like IE11 and friends.
if (fallback && isProd) {
  var support = document.createElement('script');
  support.src = config.staticScope + 'support.js';
  document.write(support.outerHTML);
}

// TODO(samthor): This is _probably_ sync in production (because this script is loaded as ES5), but
// insert the waitFor() call for sanity anyway.
WebComponents.waitFor(function() {
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
});
