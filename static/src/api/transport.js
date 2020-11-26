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

const MAX_RETRIES = 3;
const TIMEOUT = 5000;

import {build} from '../lib/params.js';


/**
 * Performs a cross-domain XHR to fetch JSON.
 *
 * @param {string} url
 * @return {!Promise<!Object<string, *>>}
 */
function fetchJSON(url) {
  const xhrPromise = new Promise((resolve) => xhrRequest(url, resolve));
  return xhrPromise.then((xhr) => {
    if (xhr instanceof Error) {
      throw xhr;  // we only pass resolve to xhrRequest; rethrow with Error
    }

    let out;
    try {
      out = JSON.parse(xhr.responseText);
    } catch (e) {
      console.warn('invalid JSON from API', url);
      console.debug('raw response', this.responseText)
      throw e;
    }
    if (!out || typeof out !== 'object') {
      console.warn('non-object JSON return', out);
      return {'status': out};
    }
    return out;
  });
}


/**
 * @param {string} url
 * @param {function(!XMLHttpRequest)} resolve to call with loaded XHR
 * @param {number=} requestNo request count, for retries
 */
function xhrRequest(url, resolve, requestNo = 0) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.timeout = TIMEOUT;  // IE needs this >open but <send
  xhr.onload = () => resolve(xhr);
  xhr.onerror = () => {
    if (requestNo >= MAX_RETRIES) {
      return resolve(new Error(`exceeded retry limit for: ${url}`));
    }
    ++requestNo;

    // Retry with exponential backoff (625ms, ~1.5s, ~4s, ~10s, ...).
    const at = Math.pow(2.5, requestNo) * 250;
    console.debug('xhr failure, retry', requestNo, 'delay', at, 'url', url);
    self.setTimeout(() => xhrRequest(url, resolve, requestNo), at);
  };
  xhr.send(null);
}


/**
 * Performs a cross-domain AJAX request to the Santa API.
 *
 * @param {string} url
 * @param {?Object<string, (string|number)>=} data
 * @return {!Promise<!Object<string, *>>}
 */
export function request(url, data = null) {
  const query = build(data);
  return fetchJSON(url + query);
}
