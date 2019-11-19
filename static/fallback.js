
import './src/polyfill/css.js';
import styles from './styles/santa.css';

document.adoptedStyleSheets = [styles];

import {buildLoader} from './src/core/loader.js';

import {configureProdRouter, globalClickHandler} from './src/core/router.js';
import * as gameloader from './src/elements/santa-gameloader.js';


const loaderElement = document.createElement('santa-gameloader');
document.body.append(loaderElement);


loaderElement.addEventListener(gameloader.events.error, (ev) => {
  throw new Error('unhandled load error');
});


loaderElement.addEventListener(gameloader.events.prepare, (ev) => {
  const {context, resolve, control, ready} = ev.detail;

  const prepare = async (control, data) => {
    if (!control.hasPort) {
      return {};
    }
    control.send({type: 'data', payload: data});

    for (;;) {
      const op = await control.next();
      const {type, payload} = op;

      switch (type) {
        case 'preload':
          // TODO(samthor): This is fragile.
          const [preloadType, event, port] = payload;
          port.postMessage(null);
          break;

        case 'loaded':
          return payload;

        default:
          // We ignore progress indicators.
      }
    }
  };

  const call = async () => {
    const {data, route, error, locked} = context;
    await prepare(control, data);

    if (!ready()) {
      return false;
    }
    control.send({type: 'ready'});
    document.body.classList.remove('loading');

    if (locked) {
      // TODO(samthor): Do something.
    }
  };
  resolve(call());
});

const {scope, go} = configureProdRouter(buildLoader(loaderElement));
document.body.addEventListener('click', globalClickHandler(scope, go));
