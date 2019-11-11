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
 * Remove redundant clip-paths from the instantiated Lottie element.
 *
 * This speeds up Firefox and Safari because these paths are basically redundant.
 *
 * @param {!SVGElement} svg
 */
function cleanupLottie(svg) {
  const paths = Array.from(svg.querySelectorAll('clipPath'));
  const width = svg.getAttribute('width');
  const height = svg.getAttribute('height');

  if (!width || !height) {
    return;
  }

  // If this value is in the path, then it's probably a simple rect.
  const rectPath = `M0,0 L${width},0 L${width},${height} L0,${height}z`;

  paths.forEach((path) => {
    if (path.children.length !== 1) {
      return;
    }
    const check = path.children[0];

    if (check.localName === 'rect' && check.getAttribute('width') === width && check.getAttribute('height') === height) {
      // found a bounding rect
    } else if (check.localName === 'path' && check.getAttribute('d') === rectPath) {
      // found a full-sized path
    } else {
      return;
    }

    path.remove();
  });
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
      path: path + '?#',  // in dev, this ensures JSON is returned raw
      renderer: 'svg',
      container,
      autoplay: false,
    }, options));

    return new Promise((resolve, reject) => {
      anim.addEventListener('DOMLoaded', () => {
        if (options && options.clearDefs) {
          const svg = anim.renderer.svgElement;
          cleanupLottie(svg);
        }
        resolve(anim);
      });
      anim.addEventListener('data_failed', reject);
    });
  });
}
