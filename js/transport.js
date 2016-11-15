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
 * Performs a cross-domain AJAX request to the Santa API.
 * @param {string} url
 * @param {!Object} data
 * @param {function(!Object)} done
 * @param {function()} fail
 */
function santaAPIRequest(url, data, done, fail) {
  // TODO(samthor): support a Promise as a return type.
  let requests = 0;

  const query = (function() {
    const m = key => window.encodeURIComponent(key) + '=' + window.encodeURIComponent(data[key]);
    const out = Object.keys(data).map(m).join('&');
    return out ? '?' + out : '';
  })();

  /** @this {XMLHttpRequest} */
  function onload() {
    let out;
    try {
      out = JSON.parse(this.responseText);
    } catch (e) {
      console.debug('invalid JSON from santa-api', e);
      fail();
      return;
    }
    if (!out || typeof out !== 'object') {
      console.warn('non-object JSON return', out);
      out = {'status': out};
    }
    done(/** @type {!Object} */ (out));
  }

  function request() {
    if (requests >= santaAPIRequest.MAX_RETRIES) {
      fail();
      return;
    }
    ++requests;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', santaAPIRequest.BASE + url + query);
    xhr.timeout = santaAPIRequest.TIMEOUT;  // IE needs this >open but <send
    xhr.onload = onload;
    xhr.onerror = function() {
      // Retry with exponential backoff (625ms, ~1.5s, ~4s, ~10s, ...).
      window.setTimeout(request, Math.pow(2.5, requests) * 250);
    };
    xhr.send(null);
  }

  request();
}

/** @define {string} */
santaAPIRequest.BASE = '';

/** @const */
santaAPIRequest.MAX_RETRIES = 3;

/** @const */
santaAPIRequest.TIMEOUT = 5000;
