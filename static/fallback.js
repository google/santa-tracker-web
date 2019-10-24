
import {buildLoader} from './src/core/loader.js';

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

const {scope, go} = configureProdRouter(buildLoader(loaderElement));
document.body.addEventListener('click', globalClickHandler(scope, go));
