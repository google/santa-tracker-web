
import {dedupFrame} from '../../src/lib/dedup.js';

/**
 * @param {!HTMLElement} container
 * @param {string} key
 * @param {string=} preserveAspectRatio
 * @return {!Promise<*>}
 */
export function initAnimation(container, key, preserveAspectRatio = undefined) {
  const p = new Promise((resolve, reject) => {
    const anim = lottie.loadAnimation({
      container,
      autoplay: false,
      renderer: 'svg',
      path: `img/modules/${key}.json`,
      rendererSettings: {
        className: 'animation__svg',
        preserveAspectRatio,
      },
    });
    anim.addEventListener('DOMLoaded', () => resolve(anim));
    anim.addEventListener('data_failed', reject);
  });

  return p;
}

/**
 * @param {function(): void} handler to run on a rAF after scroll or resize
 */
export function installAdjustHandler(handler) {
  const deduped = dedupFrame(handler);
  ['scroll', 'resize'].forEach((eventType) => {
    window.addEventListener(eventType, deduped, {passive: true});
  });
}
