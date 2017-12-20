/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @param {!Object<string, (string|number)>} data
 * @return {string}
 */
function buildQueryString(data) {
  const enc = (v) => window.encodeURIComponent(v);
  const mapper = (key) => `${enc(key)}=${enc(data[key])}`;

  const out = Object.keys(data).map(mapper).join('&');
  if (out) {
    return `?${out}`;
  }
  return '';
}

/**
 * Performs a cross-domain AJAX request to fetch JSON.
 *
 * @param {string} url
 * @return {!Promise<!Object<string, *>>}
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    let requests = 0;

    /** @this {XMLHttpRequest} */
    function onload() {
      let out;
      try {
        out = JSON.parse(this.responseText);
      } catch (e) {
        console.debug('invalid JSON', e);
        return reject(e)
      }
      if (!out || typeof out !== 'object') {
        console.warn('non-object JSON return', out);
        out = {'status': out};
      }
      resolve(/** @type {!Object<string, *>} */ (out));
    }

    (function request() {
      if (requests >= santaAPIRequest.MAX_RETRIES) {
        return reject();
      }
      ++requests;

      const xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.timeout = santaAPIRequest.TIMEOUT;  // IE needs this >open but <send
      xhr.onload = onload;
      xhr.onerror = () => {
        // Retry with exponential backoff (625ms, ~1.5s, ~4s, ~10s, ...).
        window.setTimeout(request, Math.pow(2.5, requests) * 250);
      };
      xhr.send(null);
    })();
  });
}

/**
 * Performs a cross-domain AJAX request to the Santa API.
 *
 * @param {string} url
 * @param {!Object<string, (string|number)>} data
 * @return {!Promise<!Object<string, *>>}
 */
function santaAPIRequest(url, data) {
  const query = buildQueryString(data);
  return fetchJSON(santaAPIRequest.BASE + url + query);
}

/** @define {string} */
santaAPIRequest.BASE = '';

/** @const */
santaAPIRequest.MAX_RETRIES = 3;

/** @const */
santaAPIRequest.TIMEOUT = 5000;
