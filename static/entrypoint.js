/**
 * @fileoverview Main entrypoint for Santa Tracker. Runs in the prod domain.
 */

import './src/elements/santa-chrome.js';
import './src/elements/santa-countdown.js';
import * as gameloader from './src/elements/santa-gameloader.js';
import './src/elements/santa-sidebar.js';
import './src/elements/santa-error.js';
import * as params from './src/lib/params.js';
import * as kplay from './src/kplay.js';
import scenes from './src/strings/scenes.js';
import {_msg, join} from './src/magic.js';


const kplayReady = kplay.prepare();


// TODO(samthor): If this doesn't work, we need a foreground unmute button, as clicking on the
// iframe probably won't trigger it.
//sc.installGestureResume(document.body);


const simplePathMatcher = /^\/?(?:|(\w+)\.html)$/;


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
  let trailing = pathname;
  if (matchLang) {
    trailing = '/' + trailing.substr(matchLang[0].length);
  }
  const matchScene = simplePathMatcher.exec(trailing);
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
const chrome = document.createElement('santa-chrome');
document.body.append(chrome, loader);

const error = document.createElement('santa-error');
loader.append(error);


const sidebar = document.createElement('santa-sidebar');
sidebar.todayHouse = 'snowball';
sidebar.setAttribute('slot', 'sidebar');
chrome.append(sidebar);


document.body.addEventListener('click', (ev) => {
  if (ev.ctrlKey || ev.metaKey || ev.which > 1) {
    return false;  // ignore event while buttons are pressed
  }

  let target;
  const path = ev.composedPath();
  path.reverse();
  for (const cand of path) {
    if (cand.localName === 'a' && cand.href) {
      target = new URL(cand.href);
      break;
    }
  }
  if (!target || !target.toString().startsWith(load.scope)) {
    return false;
  }

  const rest = '/' + target.toString().substr(load.scope.length);
  const matchScene = simplePathMatcher.exec(rest);
  if (!matchScene) {
    return false;
  }

  santaApp.route = matchScene[1] || '';
  ev.preventDefault();
});


const sceneImage = (sceneName) => {
  const img = document.createElement('img');

  img.src = join(import.meta.url, 'img/scenes', sceneName + '_2x.png');
  img.srcset = `${join(import.meta.url, 'img/scenes', sceneName + '_1x.png')}, ${img.src} 2x`;

  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};


/**
 * Handle preload, ostensibly for any data loaded by the parent frame, but really just for Klang.
 */
loader.addEventListener(gameloader.events.preload, (ev) => {
  const {event, update, resolve} = ev.detail;
  const work = async () => {
    const parts = event.split(':');
    if (parts[0] !== 'sounds') {
      throw new TypeError(`expected preload for sounds, was: ${event}`);
    }

    const sc = await kplayReady;
    await sc.preload(parts[1], (done, total) => update({done, total}));
  };
  resolve(work());
});


let activePort = null;
let soundcontroller = null;

kplayReady.then((sc) => {
  soundcontroller = sc;
  document.body.addEventListener('click', () => sc.resume(), {once: true});
});


loader.addEventListener(gameloader.events.ready, (ev) => {
  const {resolve, href, empty, port} = ev.detail;
  ev.preventDefault();

  if (port) {
    activePort = port;

    port.onmessage = (ev) => {
      if (activePort !== port) {
        console.warn('got data on inactive port', ev.data);
        return false;
      }

      const {type, payload} = ev.data;
      switch (type) {
        case 'go':
          santaApp.route = payload;
          break;

        case 'klang':
          const request = payload.shift();
          switch (request) {
            case 'ambient':
              console.info('transition');
              soundcontroller.transitionTo(payload[0]);
              break;

            case 'fire':
            case 'play':
              soundcontroller.play(...payload);
              break;

            default:
              console.warn('unhandled klang', request, payload);
          }

          break;

        default:
          console.warn('unhandled port message', type, payload);
      }
    };

  } else {
    activePort = null;  // invalidate previous port
  }

  // TODO(samthor): This method is a little awkward, but configures whether the error is displayed,
  // and what it displays (e.g. a locked image).
  // If `empty` is false, then it actually never shows at all, since the slot is `display: none`.

  const handler = async () => {
    const locked = (!href && santaApp.route);
    error.textContent = '';

    if (!locked) {
      error.error = empty && Boolean(href);
      error.lock = false;
      return;
    }

    error.lock = true;
    let img;
    try {
      img = await sceneImage(santaApp.route);
    } catch (e) {
      console.warn('err img', e);
      return;  // ignore, bad image
    }
    img.setAttribute('slot', 'icon');
    error.append(img);
    error.lock = true;
    error.error = false;
  };
  resolve(handler());
});


const loaderScene = (sceneName) => {
  const title = scenes[sceneName] || '';
  if (title) {
    document.title = `${title} · ${_msg`santatracker`}`;
  } else {
    document.title = _msg`santatracker`;
  }

  chrome.mini = ['', 'press', 'educators', 'tracker'].indexOf(sceneName) === -1;

  const locked = ['tracker'].indexOf(sceneName) !== -1;
  const url = locked ? null : join(import.meta.url, 'scenes', (sceneName || 'index') + '/');

  if (loader.href === url) {
    return false;
  }
  loader.load(url).then((port) => {
    console.info('loading done with port', port, 'for', url);
  });
};

window.addEventListener('popstate', () => loaderScene(wh.state.sceneName));
loaderScene(wh.state.sceneName);

window.santaApp = {
  get route() {
    return wh.state && wh.state.sceneName;
  },
  set route(sceneName) {
    sceneName = String(sceneName).toLowerCase().replace(/[^\w]/g, '');
    if (sceneName === 'index') {
      sceneName = '';
    }
    updateHistory(sceneName);
    loaderScene(sceneName);
  },
};



