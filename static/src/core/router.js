/**
 * @fileoverview Prod router setup code.
 */

import * as params from '../lib/params.js';


/**
 * Matches "/sceneName.html" or "/".
 */
const simplePathMatcher = /^\/?(?:|(\w+)\.html)$/;


/**
 * JSON clone helper.
 */
const deepClone = (raw) => JSON.parse(JSON.stringify(raw));


/**
 * Normalize the passed scene name.
 *
 * @param {string} sceneName to normalize
 * @return {string} normalized name, possibly the blank string
 */
export function normalizeSceneName(sceneName) {
  sceneName = String(sceneName || '').toLowerCase().replace(/[^\w]/g, '');

  // These should always map to "".
  if (sceneName === 'index' || sceneName === 'village') {
    sceneName = '';
  }

  return sceneName;
}


/**
 * Normalize the given language string, e.g. "DE" => "de", or "En-gB" => "en-GB".
 *
 * @param {string} lang to normalize
 * @return {string}
 */
export function normalizeLang(lang) {
  const parts = (lang || '').split('-');
  parts[0] = parts[0].toLowerCase();
  if (parts.length >= 2) {
    parts[1] = parts[1].toUpperCase();
  }
  return parts.join('-');
}


/**
 * Finds the canonical URL for sharing and URL changes. Look in /intl/.../ and ?hl=... for user
 * override lang. Send the browser to the correct /intl/ version via History API. e.g.,
 *  * loading "/#foo?hl=de" will get "/intl/de/#foo"
 *  * loading "/intl/xx/" will get "/intl/xx/", but load default lang (xx doesn't exist)
 *
 * Note that in production, this code is already localized: it knows what language it's loaded as.
 * However, respect the user's wishes, as the code has been served under that path anyway.
 *
 * @param {!Location} location
 * @return {{scope: string, sceneName: string, data: !Object<string, string>}}
 */
export function resolveProdURL(location) {
  const data = params.read(location.search);
  const pathname = location.pathname || '/';

  // nb: ?hl=de_XXX is actually invalid/ignored (it's not used as a prefix)
  let queryLang = (data['hl'] || '');
  if (queryLang.indexOf('_') !== -1) {
    queryLang = '';
  }
  delete data['hl'];

  // Look for "/intl/../", and strip any "de_..." part of the lang. This wins over ?hl=...
  const matchLang = pathname.match(/^\/intl\/([-\w]+?)(?:|_[-_\w]+)\//);
  const requestLang = (matchLang && matchLang[1]) || queryLang || null;

  // Grab the final URL component. This intentionally only matches the last part, as Santa Tracker
  // is only served through the top-level and the /intl/.../ paths.
  let trailing = pathname;
  if (matchLang) {
    trailing = '/' + trailing.substr(matchLang[0].length);
  }
  const matchScene = simplePathMatcher.exec(trailing);
  const sceneName = normalizeSceneName(matchScene && matchScene[1]);

  let scope = `${location.origin}/`;
  if (requestLang) {
    scope += `intl/${normalizeLang(requestLang)}/`;
  }
  return {scope, sceneName, data};
}


/**
 * Sets up the prod router, including modifying the initial URL, and installing popstate handlers
 * and friends.
 *
 * Returns site scope and routing helper.
 *
 * @param {function(string, !Object<string, string>): void} callback to load page
 * @return {{scope: string, go: function(string, !Object<string, string>): void}}
 */
export function configureProdRouter(callback) {
  if (window.santaApp) {
    throw new Error('cannot configureProdRouter twice');
  }

  const load = resolveProdURL(window.location);
  const wh = window.history;

  const updateHistory = (sceneName, data, replace=false) => {
    const url = load.scope + (sceneName ? sceneName + '.html' : '') + params.build(data);
    const state = {sceneName, data};  // nb. window.history deep-copies data
    if (!replace && (!wh.state || wh.state.sceneName !== sceneName)) {
      wh.pushState(state, null, url);
    } else if (url !== window.location.href) {
      replace = true;
    }
    replace && wh.replaceState(state, null, url);
  };

  updateHistory(load.sceneName, load.data, true);

  // Install `popstate` handler and trigger immediately to configure initial state.
  const refresh = () => {
    const data = deepClone(wh.state.data);
    callback(wh.state.sceneName, data);
  };
  window.addEventListener('popstate', refresh);
  refresh();

  // Provide expected `santaApp` helper.
  window.santaApp = {
    get route() {
      return wh.state && wh.state.sceneName;
    },
    set route(sceneName) {
      this.go(sceneName);
    },
    go(sceneName, data={}) {
      sceneName = normalizeSceneName(sceneName);
      updateHistory(sceneName, data);
      refresh();
    },
  };

  return {
    scope: load.scope,
    go: santaApp.go,
  };
}


function nearestComposedLink(ev) {
  const path = ev.composedPath();
  path.reverse();
  for (const cand of path) {
    if (cand.localName === 'a' && cand.href) {
      return new URL(cand.href);
    }
  }
  return null;
}


function nearestClosestLink(ev) {
  const cand = ev.target.closest('a[href]');
  if (cand) {
    return new URL(closest.href);
  }
  return null;
}


const nativeNearest = Event.prototype.composedPath ? nearestComposedLink : nearestClosestLink;


/**
 * Returns an click handler that can be added to the body which will intercept clicks on Santa
 * pages, and call the internal handler.
 *
 * @param {string} scope intercept scene under this scope only
 * @param {function(string, !Object<string, string>): void} go to invoke change
 * @return {function(!Event): boolean}
 */
export function globalClickHandler(scope, go) {
  return (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.which > 1) {
      return false;  // ignore event while buttons are pressed
    }

    const target = nativeNearest(ev);
    if (target === null || !target.toString().startsWith(scope)) {
      return false;
    }

    const rest = target.pathname.substr(scope.length - target.origin.length - 1);  // include "/"
    const matchScene = simplePathMatcher.exec(rest);
    if (!matchScene) {
      return false;
    }

    // TODO(samthor): This eats "#foo" links. That's probably fine.

    const data = params.read(target.search);
    go(matchScene[1] || '', data);
    ev.preventDefault();
    return true;
  };
}

