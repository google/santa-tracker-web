/**
 * @fileoverview Main entrypoint for Santa Tracker. Runs in the prod domain.
 */

import './src/elements/santa-gameloader.js';
import * as params from './src/lib/params.js';
import {join} from './src/magic.js';

/**
 * Finds the canonical URL for sharing and URL changes. Look in /intl/.../ and ?hl=... for user
 * override lang. Send the browser to the correct /intl/ version via History API. e.g.,
 *  * loading "/#foo?hl=de" will get "/intl/de/#foo"
 *  * loading "/intl/xx/" will get "/intl/xx/", but load default lang (xx doesn't exist)} location
 *
 * @param {!Location} location
 * @return {{scope: string, sceneName: string, data: !Object<string, string>}}
 */
function resolveProdURL(location) {
  const data = params.read(location.search);
  const pathname = location.pathname || '/';

  // Look for /intl/../ (look for _last_). This wins over ?hl=...
  const matchLang = pathname.match(/^\/intl\/([^_/]+)(?:|_ALL)\//);
  const requestLang = matchLang && matchLang[1] || data['hl'] || null;
  delete data['hl'];

  // Grab the final URL component. This intentionally only matches the last part, as Santa Tracker
  // is only served through the top-level and the /intl/.../ paths.
  const matchScene = pathname.match(/\/(?:(\w+)\.html|)$/);
  let sceneName = matchScene && matchScene[1] || '';
  
  // Rewrite old non-scenes.
  if (sceneName === 'index' || sceneName === 'village') {
    sceneName = '';
  }

  let scope = location.origin + '/';
  if (requestLang) {
    scope += `intl/${requestLang}/`;
  }
  return {scope, sceneName, data};
}


const load = resolveProdURL(window.location);

export const updateHistory = (sceneName, data, replace=false) => {
  const url = load.scope + (sceneName ? sceneName + '.html' : '') + params.build(data);
  const state = {sceneName, data};  // nb. window.history deep-copies data
  if (!replace && (!history.state || history.state.sceneName !== sceneName)) {
    window.history.pushState(state, null, url);
  } else if (url !== window.location.href) {
    replace = true;
  }
  replace && window.history.replaceState(state, null, url);
}

updateHistory(load.sceneName, load.data, true);


const loader = document.createElement('santa-gameloader');
document.body.appendChild(loader);

loader.href = join(import.meta.url, 'scenes', (load.sceneName || 'index') + '/');

// TODO TODO: remove after ready
window.setTimeout(() => {
  updateHistory('boatload', {});
  loader.href = join(import.meta.url, 'scenes', 'boatload/');
}, 5000);

// TODO: add history handler