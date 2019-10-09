/**
 * @fileoverview Loader code for Santa Tracker. Adds a <script ...> pointing to the entrypoint.
 *
 * This is transpiled down to ES5-compatible code before being run. It should not use modern
 * library code, like `Promise`.
 */

import config from './config.json';

// In prod, the documentElement has `lang="en"` or similar.
const documentLang = document.documentElement.lang || null;
const isProd = (documentLang !== null);

// Global error handler. Redirect if we fail to load the entrypoint.
let loaded = false;
window.onerror = (msg, file, line, col, error) => {
  if (isProd && !loaded) {
    window.location = 'error.html';
  }
};

// Allow optional ?static=... for testing new releases.
if ('URLSearchParams' in window) {
  const p = new URLSearchParams(window.location.search);
  if (p.has('static')) {
    const staticScopeUrl = new URL(p.get('static'), window.location);
    if (!staticScopeUrl.pathname.match(/\/$/)) {
      staticScopeUrl.pathname += '/';
    }
    config.staticScope = staticScopeUrl.toString();

    console.warn('loading static', config.staticScope);
    p.delete('static');
  }
}

document.body.setAttribute('static', config.staticScope);

const entrypoint = document.createElement('script');
entrypoint.type = 'module';
entrypoint.src = config.staticScope + 'entrypoint' + (isProd ? `_${documentLang}` : '') + '.js';

entrypoint.onload = () => {
  loaded = true;
  document.body.classList.remove('loading');
};
entrypoint.onerror = () => {
  throw new Error(`error loading entrypoint: ${entrypoint.src}`);
};

document.head.appendChild(entrypoint);