/**
 * @fileoverview Loader code for Santa Tracker. Adds a <script ...> pointing to the entrypoint.
 *
 * This is transpiled down to ES5-compatible code before being run. It should not use modern
 * library code, like `Promise`, until the support library is loaded.
 */

import config from './config.json';
import checkFallback from './src/fallback.js';
import * as load from './src/load.js';

console.info('Santa Tracker', config.version);

// In prod, the documentElement has `lang="en"` or similar.
const documentLang = document.documentElement.lang || null;
const isProd = (documentLang !== null);

// Global error handler. Redirect if we fail to load the entrypoint.
let loaded = false;
window.onerror = (msg, file, line, col, error) => {
  if (isProd && !loaded) {
//    window.location.href = 'error.html';
  }
  console.warn('error');
};

function start(fallback) {
  // Allow optional ?static=... for testing new releases.
  const p = new URLSearchParams(window.location.search);
  if (p.has('static')) {
    const staticScopeUrl = new URL(p.get('static'), window.location);
    if (!staticScopeUrl.pathname.match(/\/$/)) {
      staticScopeUrl.pathname += '/';
    }
    config.staticScope = staticScopeUrl.toString();
    console.warn('loading static', config.staticScope);
  }
  if (p.has('fallback')) {
    fallback = true;
  }
  document.body.setAttribute('static', config.staticScope);

  // Load entrypoint.
  const entrypoint = config.staticScope + (fallback ? 'fallback' : 'entrypoint') + (isProd ? `_${documentLang}` : '') + '.js';
  return load.script(entrypoint, fallback && isProd ? '' : 'module').then(() => {
    loaded = true;
    document.body.classList.remove('loading');
  });
}

if (checkFallback()) {
  const support = document.createElement('script');
  support.src = config.staticScope + 'support.js';
  document.head.appendChild(support);
  support.onload = support.onerror = () => start(true);  // load even if an error occured
} else {
  start();
}
