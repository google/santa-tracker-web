import * as config from './config.js';
import {join} from '../lib/url.js';
import scenes from '../strings/scenes.js';
import {_msg} from '../magic.js';

const lang = document.documentElement.lang;

export function buildLoader(loaderElement) {
  return (route, data) => {
    // TODO(samthor): Load support HTML.
    const trailingIndex = `index${lang ? `_${lang}` : ''}.html`;
    const locked = config.isLocked(route);

    let url = null;
    if (!locked) {
      const isIndex = (!route || route === 'index');
      const sceneName = isIndex ? config.indexScene() : route;
      url = join(import.meta.url, '../../scenes', sceneName, trailingIndex);
    }

    ga('set', 'page', `/${route}`);
    ga('send', 'pageview');

    // TODO: can we pass route or only resolved sceneName?
    loaderElement.load(url, {route, data, locked}).then((success) => {
      if (success) {
        document.title = scenes[route] || _msg`santatracker`;
      }
    });
  };
};
