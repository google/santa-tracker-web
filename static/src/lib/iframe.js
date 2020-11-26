/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
