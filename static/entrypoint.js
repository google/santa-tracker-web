/**
 * @fileoverview Main entrypoint for Santa Tracker. Runs in the prod domain.
 */

import './src/elements/santa-gameloader.js';
import * as params from './src/lib/params.js';
import {join} from './src/magic.js';


const invalidScenes = ['index', 'village'];


/**
 * Normalize the given language string, e.g. "DE" => "de", or "En-gB" => "en-GB".
 *
 * @param {string} lang to normalize
 * @return {string}
 */
function normalizeLang(lang) {
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
function resolveProdURL(location) {
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
  const matchScene = pathname.match(/\/(?:(\w+)\.html|)$/);
  let sceneName = (matchScene && matchScene[1]) || '';
  
  // Rewrite old non-scenes.
  if (invalidScenes.indexOf(sceneName) !== -1) {
    sceneName = '';
  }

  let scope = `${location.origin}/`;
  if (requestLang) {
    scope += `intl/${normalizeLang(requestLang)}/`;
  }
  return {scope, sceneName, data};
}


const load = resolveProdURL(window.location);
const wh = window.history;

const updateHistory = (sceneName, data={}, replace=false) => {
  const url = load.scope + (sceneName ? sceneName + '.html' : '') + params.build(data);
  const state = {sceneName, data};  // nb. window.history deep-copies data
  if (!replace && (!wh.state || wh.state.sceneName !== sceneName)) {
    wh.pushState(state, null, url);
  } else if (url !== window.location.href) {
    replace = true;
  }
  replace && wh.replaceState(state, null, url);
}

updateHistory(load.sceneName, load.data, true);


const loader = document.createElement('santa-gameloader');
document.body.appendChild(loader);

const loaderScene = (sceneName) => {
  loader.href = join(import.meta.url, 'scenes', (sceneName || 'index') + '/');
};

window.addEventListener('popstate', () => loaderScene(wh.state.sceneName));
loaderScene(wh.state.sceneName);

window.santaApp = {
  get route() {
    return wh.state && wh.state.sceneName || null;
  },
  set route(sceneName) {
    updateHistory(sceneName);
    loaderScene(sceneName);
  },
};
