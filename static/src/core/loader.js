import * as config from './config.js';
import {join} from '../lib/url.js';
import scenes from '../strings/scenes.js';
import {_msg} from '../magic.js';

const lang = document.documentElement.lang;

export function buildLoader(loaderElement) {
  let activeSceneName = undefined;

  return (route, data) => {
    // TODO(samthor): Load support HTML.
    const trailingIndex = `index${lang ? `_${lang}` : ''}.html`;
    const locked = config.isLocked(route);

    let url = null;
    if (!locked) {
      const isIndex = (!route || route === 'index');
      const sceneName = isIndex ? config.indexScene() : route;
      if (activeSceneName === sceneName) {
        return;  // already loaded, do nothing
      }
      activeSceneName = sceneName;
      url = join(import.meta.url, '../../scenes', sceneName, trailingIndex);
    } else if (activeSceneName === null) {
      return;  // already locked, do nothing
    } else {
      activeSceneName = null;
    }

    ga('set', 'page', `/${route}`);
    ga('send', 'pageview');

    loaderElement.load(url, {route, data, locked}).then((success) => {
      if (success) {
        document.title = scenes[route] || _msg`santatracker`;
      }
    });
  };
};
