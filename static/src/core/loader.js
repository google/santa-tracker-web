import * as config from './config.js';
import {join} from '../lib/url.js';
import scenes from '../strings/scenes.js';
import {_msg} from '../magic.js';

// TODO(samthor): Load support HTML if required.
const lang = document.documentElement.lang;
const trailingIndex = `index${lang ? `_${lang}` : ''}.html`;

function urlFor(sceneName, fallback, route, hash) {
  if (!sceneName) {
    return null;
  }
  if (hash && hash[0] !== '#') {
    hash = '#' + hash;
  }
  const params = new URLSearchParams();
  if (fallback) {
    params.set('fallback', '1');
  }
  params.set('route', route);
  const p = `?${params.toString()}`;
  return join(import.meta.url, '../../scenes', sceneName, trailingIndex) + p + (hash || '');
}

export function buildLoader(loadMethod, fallback=false) {
  let activeRoute = undefined;
  let activeSceneName = undefined;

  const load = (route, data, hash) => {
    // Optionally redirect; used to hide press/educators page
    const redirectRoute = config.redirectRoute(route);
    if (redirectRoute !== undefined) {
      route = redirectRoute;
    }
    if (route === 'index') {
      route = '';
    }

    activeRoute = route;  // this is the chosen open route
    const sceneName = config.sceneForRoute(route, fallback);

    if (activeSceneName === sceneName) {
      return redirectRoute;  // loaded (locked or valid), do nothing
    }

    // Load the scene HTML but include the ID of the route. Useful for videos.
    const url = urlFor(sceneName, fallback, route, hash);
    activeSceneName = sceneName;

    window.dispatchEvent(new CustomEvent('loader-route', {detail: route}));

    ga('set', 'page', `/${route}`);
    ga('send', 'pageview');

    const locked = (activeSceneName === null);
    loadMethod(url, {route, data, locked}).then((success) => {
      document.title = scenes[route] || _msg`santatracker`;
    });

    return redirectRoute;
  };

  // If we see a config update, always try to reload the current scene (in case it locks or unlocks
  // or the server redirects it to another scene).
  config.listen(() => load(activeRoute));

  return load;
};
