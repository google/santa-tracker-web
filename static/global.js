
import createStore from 'unistore';
import {dedupFrame} from './src/lib/decorators.js';

const g = createStore({
  mini: false,

  orientation: null,
  sceneOrientation: null,

  hidden: false,
});

export default g;

const startup = (fn) => {
  const call = fn(g);
  call && call();
};

/**
 * Listen for changes in portrait/landscape mode.
 */
startup((global) => {
  const portraitMedia = window.matchMedia('(min-device-width: 1px) and (max-device-width: 600px) and (orientation: portrait)');
  const landscapeMedia = window.matchMedia('(min-device-height: 1px) and (max-device-height: 600px) and (orientation: landscape)');

  const update = () => {
    let orientation = null;
  
    if (portraitMedia.matches) {
      orientation = 'portrait';
    } else if (landscapeMedia.matches) {
      orientation = 'landscape';
    }
  
    global.setState({orientation});
  };

  const d = dedupFrame(update);
  portraitMedia.addEventListener('change', d);
  landscapeMedia.addEventListener('change', d);

  return update;
});

/**
 * Listen for global visibility changes.
 */
startup((global) => {
  const handler = () => {
    global.setState({hidden: document.hidden || false});
  };
  document.addEventListener('visibilitychange', handler);
  return handler;
});
