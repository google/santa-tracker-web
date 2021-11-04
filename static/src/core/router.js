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
 * @fileoverview Prod router setup code.
 */

import * as params from '../lib/params.js';
import {goEvent} from './common.js';
import {internalNavigation} from '../scene/route.js';
import isAndroid from './android.js';


/**
 * Matches "/sceneName.html" or "/".
 */
const simplePathMatcher = /^\/?(?:|(@?\w+)\.html)$/;


/**
 * JSON clone helper.
 */
const deepClone = (raw) => JSON.parse(JSON.stringify(raw));


/**
 * Returns the pathname for the given location, always starting with "/".
 *
 * This works around an IE11 bug.
 *
 * @param {?Location} location
 * @return {string}
 */
function pathnameForLocation(location) {
  const p = location && location.pathname || '/';
  if (p.startsWith('/')) {
    return p;
  }
  return '/' + p;
}


/**
 * Normalize the passed route.
 *
 * @param {string} route to normalize
 * @return {string} normalized name, possibly the blank string
 */
export function normalizeRoute(route) {
  return String(route || '').toLowerCase().replace(/[^\w]/g, '');
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
 * @return {{scope: string, route: string, data: !Object<string, string>, hash: string}}
 */
export function resolveProdURL(location) {
  const data = params.read(location.search);
  let pathname = pathnameForLocation(location);

  // Strip secret development URLs.
  const matchDev = pathname.match(/^\/\w+-\w{24,30}\//);
  if (matchDev) {
    pathname = pathname.substr(matchDev[0].length - 1);
  }

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
  if (matchLang) {
    pathname = '/' + pathname.substr(matchLang[0].length);
  }
  const matchScene = simplePathMatcher.exec(pathname);
  const route = normalizeRoute(matchScene && matchScene[1]);

  let scope = `${location.origin}/`;
  if (requestLang) {
    scope += `intl/${normalizeLang(requestLang)}/`;
  }
  return {scope, route, data, hash: location.hash || ''};
}


/**
 * Route to the corresponding Android scene for the passed route.
 */
function routeToAndroid(route) {
  let androidRoute = undefined;
  if (route[0] === '@') {
    androidRoute = route.substr(1);
  } else if (isAndroid()) {
    if (route === 'jetpack' || route === 'gumball') {
      androidRoute = route;
    } else if (route === 'matching') {
      // Name mismatch from web/Android.
      androidRoute = 'memory';
    }
  }
  if (!androidRoute) {
    return false;
  }

  console.info('loading Android route', androidRoute);
  const hostname = window.location.hostname;
  window.location = `com.google.android.apps.santatracker://${hostname}/android/${androidRoute}`;
  return true;
}


/**
 * Sets up the prod router, including modifying the initial URL, and installing popstate handlers
 * and friends.
 *
 * Returns site scope and routing helper.
 *
 * @param {function(string, !Object<string, string>, string): string} callback to load page
 * @return {{scope: string, go: function(string, !Object<string, string>): void}}
 */
export function configureProdRouter(callback) {
  if (window.santaApp.go) {
    throw new Error('cannot configureProdRouter twice');
  }

  const load = resolveProdURL(window.location);
  const wh = window.history;
  let lastState = null;

  // Install `popstate` handler and trigger immediately to configure initial state.
  const internalRoute = ({route, data, hash}, navigation=false) => {
    data = deepClone(data);
    const updatedRoute = callback(route, data, hash);
    if (updatedRoute !== undefined) {
      route = updatedRoute;
    }

    // Now, update history...
    const url = load.scope + (route ? route + '.html' : '') + params.build(data) + (hash || '');
    const state = {route, data, hash};  // nb. window.history deep-copies data
    if (navigation && (!wh.state || wh.state.route !== route)) {
      wh.pushState(state, null, url);
    } else if (url !== window.location.href) {
      navigation = false;
    }
    navigation || wh.replaceState(state, null, url);
    lastState = state;
  };
  window.addEventListener('popstate', () => {
    const state = wh.state || lastState;
    if (!wh.state) {
      // wh.state can be null/undefined if the user twiddles the hash of the URL
      // TODO(samthor): This isn't passed down to the child frame.
      state.hash = window.location.hash || '';
    }
    internalRoute(state)
  });
  internalRoute(load);

  // Provide expected `santaApp` helper.
  Object.assign(window.santaApp, {
    get route() {
      return wh.state && wh.state.route;
    },
    set route(route) {
      this.go(route);
    },
    go(route, data={}) {
      if (routeToAndroid(route)) {
        return false;
      }

      const parts = route.split('#', 1);
      const hash = route.substr(parts[0].length);  // substr all including '#+'
      route = parts[0];

      internalRoute({route: normalizeRoute(route), data, hash}, true);
    },
  });

  // Add global 'go' event listener.
  window.addEventListener(goEvent, (ev) => {
    window.santaApp.go(ev.detail || '');
  });

  return {
    scope: load.scope,
    go: santaApp.go,
    write: (data) => {
      internalRoute({route: wh.state.route, data}, false);
    },
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
    return new URL(cand.href);
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

    const pathname = pathnameForLocation(target);
    const rest = pathname.substr(scope.length - target.origin.length - 1);  // include "/"
    const matchScene = simplePathMatcher.exec(rest);
    if (!matchScene) {
      return false;
    }

    const hash = internalNavigation(target);
    if (hash !== null) {
      ev.preventDefault();

      // Pretend to actually click on the link.
      const a = document.createElement('a');
      a.href = hash;
      a.click();

      go((matchScene[1] || '') + hash);
      return false;
    }

    // TODO(samthor): This eats "#foo" links to other pages. That's probably fine.

    const data = params.read(target.search);
    go(matchScene[1] || '', data);
    ev.preventDefault();
    return true;
  };
}

