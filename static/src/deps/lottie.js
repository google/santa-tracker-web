// import './lottie-dep.js';
// import '../../third_party/lib/lottie-worklet/lottie_canvas.js';

// const workletSupport = (function workletSupport() {
//   try {
//     CSS.paintWorklet;
//     console.warn('loading Lottie in paintWorklet')
//     return true;
//   } catch (e) {
//     return false;
//   }
// }());

const workletSupport = false;

import '../../node_modules/lottie-web/build/player/lottie_canvas.min.js';

export function loadAnimation(path, options) {
  if (!options.container) {
    throw new TypeError(`need container to load: ${path}`);
  }
  const anim = lottie.loadAnimation(Object.assign({
    path: path + '?#',  // in dev, this ensures JSON is returned raw
    renderer: workletSupport ? 'paintworklet' : 'canvas',
    autoplay: false,
  }, options));
  return anim;
}

export function promisify(anim) {
  return new Promise((resolve, reject) => {
    anim.addEventListener('DOMLoaded', () => resolve(anim));
    anim.addEventListener('data_failed', reject);
  });
}

/**
 * @param {string} path to load
 * @param {!Object<string, string>} options to append to lottie load
 * @return {!Promise<*>}
 */
export function prepareAnimation(path, options) {
  return promisify(loadAnimation(path, options));
}

export function buildSafeResize(anim) {
  if (anim.renderer.svgElement) {
    return () => {};
  }

  let rAF = 0;
  const r = anim.renderer;

  return () => {
    if (rAF === 0 && r.canvasContext) {
      rAF = window.requestAnimationFrame(() => {
        rAF = 0;
        anim.resize();
      });
    }
  };
}