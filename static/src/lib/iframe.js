
import {resolvable} from './promises.js';

/**
 * Returns a Promise which resolves on receipt of the first message recieved from it.
 *
 * Alternatively, resolves with undefined after a timeout. This relies on the frame firing a 'load'
 * event, which isn't the default: many browsers refuse to 'load' a frame that fails to load.
 * However, the 'iframe-load' library provides this guarantee.
 *
 * As a side note, the timeout should practically not be required, as a subframe can post a message
 * to its parent before load. But there are cases when no resources are required and the script
 * runs late.
 *
 * @param {!HTMLIframeElement} frame
 * @param {number=} timeout
 * @return {!Promise<*>}
 */
export function prepareMessage(frame, timeout = 10 * 1000) {
  const {promise, resolve} = resolvable();

  const handler = (ev) => {
    if (ev.source === frame.contentWindow) {
      resolve(ev.data);
    }
  };
  window.addEventListener('message', handler);

  frame.addEventListener('load', () => {
    // Fail open after ~timeout post-load.
    window.setTimeout(() => resolve(undefined), timeout);
  });

  promise.catch(() => null).then(() => {
    window.removeEventListener('message', handler);
  });

  return promise;
}
