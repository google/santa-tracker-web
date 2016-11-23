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
 * Pads an integer to have two digits.
 * @param {number} n
 * @return {string}
 * @export
 */
function padDigits(n) {
  if (n > 9) {
    return '' + n;
  }
  return '0' + n;
}

/**
 * Returns a random number in the range [min,max).
 * @param {number} min
 * @param {number=} opt_max
 * @return {number}
 * @export
 */
function randomRange(min, opt_max) {
  var max = opt_max || 0;
  return min + Math.random() * (max - min);
}

/**
 * Returns a random choice from the given array or array-like.
 * @param {!IArrayLike} array
 * @return {*}
 * @export
 */
function randomChoice(array) {
  if (array.length) {
    var idx = Math.floor(Math.random() * array.length);
    return array[idx];
  }
  return null;
}

/**
 * Checks whether the passed dates are the same calendar day.
 * @param {!Date} date1
 * @param {!Date} date2
 * @return {boolean} whether the dates are the same calendar day
 * @export
 */
function isSameDay(date1, date2) {
  return date1.getMonth() == date2.getMonth() &&
         date1.getDate() == date2.getDate() &&
         date1.getYear() == date2.getYear();
}

/**
 * @param {string} param URL parameter to look for.
 * @return {string|undefined} undefined if the URL parameter does not exist.
 * @export
 */
function getUrlParameter(param) {
  if (!window.location.search) {
    return;
  }
  var m = new RegExp(param + '=([^&]*)').exec(window.location.search.substring(1));
  if (!m) {
    return;
  }
  return decodeURIComponent(m[1]);
}

/**
 * Throttle calls to a function
 * @param {function(...*)} func
 * @param {number} ms at most one per this many ms
 * @return {function(...*)}
 * @export
 */
function throttle(func, ms) {
  var timeout, last = 0;
  return function() {
    var a = arguments, t = this, now = +(new Date);
    var fn = function() { last = now; func.apply(t,a); };
    window.clearTimeout(timeout);
    (now >= last + ms) ? fn() : timeout = window.setTimeout(fn, ms);
  }
}

/**
 * Returns an array of all scene IDs (e.g., dorf, boatload) which are cached.
 * @returns {Promise<Array<string>>}
 */
function getCachedScenes() {
  if (typeof caches == 'undefined') { return Promise.resolve([]); }

  return caches.open('persistent')
    .then(cache => cache.match('/manifest.json'))
    .then(response => response.json().version)
    .then(version => caches.open(version))
    .then(cache => cache.keys())
    .then(requests => {
      const matches = requests.map(r => r.url.match(/\/scenes\/(\w+)\//));
      return [...new Set(matches.filter(m => m).map(m => m[1]))];
    })
    .catch(error => {
      console.error('Couldn\'t retrieve cached scenes.', error);
      return [];
    });
}
