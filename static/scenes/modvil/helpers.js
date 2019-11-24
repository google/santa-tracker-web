
import {dedup} from '../../src/lib/promises.js';

/**
 * @param {function(): void} handler to run on a rAF after scroll or resize
 */
export function installAdjustHandler(handler) {
  const deduped = dedup(handler);
  ['scroll', 'resize'].forEach((eventType) => {
    window.addEventListener(eventType, deduped, {passive: true});
  });
  deduped();
}
