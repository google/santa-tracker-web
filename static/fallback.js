
import {_msg} from './src/magic.js';
import scenes from './src/strings/scenes.js';
import {join} from './src/lib/url.js';

import {configureProdRouter, globalClickHandler} from './src/core/router.js';
import * as gameloader from './src/elements/santa-gameloader.js';


const loaderElement = document.createElement('santa-gameloader');
document.body.append(loaderElement);


loaderElement.addEventListener(gameloader.events.prepare, (ev) => {
  const {context, resolve, control, ready} = ev.detail;

  // TODO(samthor): This doesn't start scenes properly.
  resolve();
  if (!ready()) {
    return false;
  }
  control.send({type: 'ready'});
});

let loadedScene = undefined;

// TODO(samthor): This is mostly shared with the actual entrypoint.
const loaderScene = (sceneName, data) => {
  if (sceneName === loadedScene) {
    return false;
  }
  document.title = scenes[sceneName] || _msg`santatracker`;

  const locked = false;
  const optionalProdIndex = document.documentElement.lang ? `index_${document.documentElement.lang}.html` : '';
  const url = locked ? null : join(import.meta.url, 'scenes', (sceneName || 'index') + '/') + (optionalProdIndex);

  loadedScene = sceneName;

  ga('set', 'page', `/${sceneName}`);
  ga('send', 'pageview');

  const context = {sceneName, data, locked};
  loaderElement.load(url, context).then((success) => {
    if (success) {
      console.info('loading done', sceneName, url);
    } else {
      console.warn('loading superceded', sceneName);
    }
  });
};


const {scope, go} = configureProdRouter(loaderScene);
document.body.addEventListener('click', globalClickHandler(scope, go));
