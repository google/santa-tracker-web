import {join} from '../lib/url.js';

let cachedLoad;

export default function load() {
  // If we're already loaded for some reason (<script> on page) then go ahead.
  if (window.lottie) {
    return window.lottie;
  } else if (cachedLoad) {
    return cachedLoad;
  }

  cachedLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = join(import.meta.url, '../../node_modules/lottie-web/build/player/lottie_light.min.js');
    script.onload = () => resolve(window.lottie);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return cachedLoad;
}

/**
 * @param {string} path to load
 * @param {!Object<string, string>} options to append to lottie load
 * @return {!Promise<*>}
 */
export function prepareAnimation(path, options) {
  return Promise.resolve(load()).then(() => {
    if (!path) {
      return Promise.reject();
    }

    const container = document.createElement('div');
    const anim = lottie.loadAnimation(Object.assign({
      path,
      renderer: 'svg',
      container,
      autoplay: false,
    }, options));

    return new Promise((resolve, reject) => {
      anim.addEventListener('DOMLoaded', () => {
        if (options.clearDefs) {
          const svg = anim.renderer.svgElement;
          const defs = svg.querySelector('defs');
          defs && defs.parentNode.removeChild(defs);
        }
        resolve(anim);
      });
      anim.addEventListener('data_failed', reject);
    });
  });
}
