import * as config from './config.js';
import {join} from '../lib/url.js';
import scenes from '../strings/scenes.js';
import {_msg} from '../magic.js';

// TODO(samthor): Load support HTML if required.
const lang = document.documentElement.lang;
const trailingIndex = `index${lang ? `_${lang}` : ''}.html`;

function urlFor(sceneName, route) {
  if (!sceneName) {
    return null;
  }
  const params = new URLSearchParams();
  params.set('route', route);
  const p = `?${params.toString()}`;
  return join(import.meta.url, '../../scenes', sceneName, trailingIndex) + p;
}

export function buildLoader(loaderElement, fallback=false) {
  let activeRoute = undefined;
  let activeSceneName = undefined;

  const load = (route, data) => {
    activeRoute = route;  // this is the chosen open route
    const sceneName = config.sceneForRoute(route, fallback);

    if (activeSceneName === sceneName) {
      return;  // loaded (locked or valid), do nothing
    }

    // Load the scene HTML but include the ID of the route. Useful for videos.
    const url = urlFor(sceneName, route);
    activeSceneName = sceneName;

    ga('set', 'page', `/${route}`);
    ga('send', 'pageview');

    const locked = (activeSceneName === null);

    loaderElement.load(url, {route, data, locked}).then((success) => {
      if (success) {
        document.title = scenes[route] || _msg`santatracker`;
      }
    });
  };

  // If we see a config update, always try to reload the current scene (in case it locks or unlocks
  // or the server redirects it to another scene).
  config.listen(() => load(activeRoute));

  return load;
};
