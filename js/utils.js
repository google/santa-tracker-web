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
 *
 * @param {number} n
 * @return {string}
 * @export
 */
function padDigits(n) {
  n = Math.floor(n);
  if (isNaN(n) || n < 0 || n >= 10) {
    return String(n);
  }
  return '0' + n;
}

/**
 * Returns a random number in the range [min,max). This number will likely not be an integer.
 *
 * @param {number} min
 * @param {number=} max 
 * @return {number}
 * @export
 */
function randomRange(min, max = undefined) {
  if (max === undefined) {
    [min, max] = [0, min];
  }
  return min + Math.random() * (max - min);
}

/**
 * Returns a random choice from the given array or array-like.
 *
 * @param {!IArrayLike} array
 * @return {*}
 * @export
 */
function randomChoice(array) {
  if (array.length) {
    const idx = Math.floor(Math.random() * array.length);
    return array[idx];
  }
  return null;
}

/**
 * Shuffles an array.
 *
 * @param {!IArrayLike<T>} opts to shuffle
 * @param {number=} limit return only this many elements
 * @return {!Array<T>}
 * @template T
 * @export
 */
function shuffleArray(opts, limit = undefined) {
  opts = Array.prototype.slice.call(opts);
  opts.sort((a, b) => Math.random() - 0.5);
  if (limit !== undefined) {
    return opts.slice(0, Math.floor(limit));
  }
  return opts;
}

/**
 * Checks whether the passed dates are the same calendar day.
 *
 * @param {!Date} date1
 * @param {!Date} date2
 * @return {boolean} whether the dates are the same calendar day
 * @export
 */
function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getYear() === date2.getYear();
}

/**
 * @param {string} param URL parameter to look for.
 * @return {string|undefined} undefined if the URL parameter does not exist.
 * @export
 */
function getUrlParameter(param) {
  return getUrlParameters()[param];
}

/**
 * @return {!Object<string>} params from the current URL
 * @export
 */
function getUrlParameters() {
  const out = {};
  const search = window.location.search || '?';

  search.substr(1).split('&').forEach((part) => {
    if (!part) {
      return;
    }

    const p = part.split('=');
    const key = window.decodeURIComponent(p[0]);
    if (!(key in out)) {
      // match URLSearchParams.get(), return the 1st param only.
      out[key] = window.decodeURIComponent(p[1] || '');
    }
  });

  return out;
}

/**
 * Throttle calls to a function
 *
 * @param {function(...*)} func
 * @param {number} ms at most one per this many ms
 * @return {function(...*)}
 * @export
 */
function throttle(func, ms) {
  let timeout = 0;
  let last = 0;
  return function() {
    const a = arguments, t = this, now = +(new Date);
    const fn = function() {
      last = now;
      func.apply(t,a);
    };
    window.clearTimeout(timeout);
    (now >= last + ms) ? fn() : timeout = window.setTimeout(fn, ms);
  }
}

/**
 * Splits a countdown (in ms) into days, hours, minutes, and seconds. Does not return -ve numbers.
 *
 * @param {number} ms countdown in milliseconds
 * @return {{days: number, hours: number, minutes: number, seconds: number}}
 * @export
 */
function countdownSplit(ms) {
  ms = Math.max(0, ms);
  const msPerDay = 24 * 60 * 60 * 1000;

  const daysX = ms / msPerDay;
  const days = Math.floor(daysX);

  const hoursX = (daysX - days) * 24;
  const hours = Math.floor(hoursX);

  const minutesX = (hoursX - hours) * 60;
  const minutes = Math.floor(minutesX);

  const secondsX = (minutesX - minutes) * 60;
  const seconds = Math.floor(secondsX);

  return {'days': days, 'hours': hours, 'minutes': minutes, 'seconds': seconds};
}

/**
 * Returns an array of all scene IDs (e.g., dorf, boatload) which are cached.
 *
 * @return {!Promise<!Array<string>>}
 * @export
 */
function getCachedScenes() {
  const caches = window.caches; 
  if (typeof caches === 'undefined') {
    return Promise.resolve([]);
  }

  return caches.open('persistent')
    .then((cache) => cache.match(window.location.origin + '/manifest.json'))
    .then((response) => response.json())
    .then((json) => caches.open(json['version']))
    .then((cache) => cache.keys())
    .then((requests) => {
      const urls = requests.map((r) => r.url);
      const matchesRe = urls.map((url) => url.match(/\/scenes\/(\w+)\//));
      const matches = matchesRe.filter((m) => m).map((m) => m[1]);
      return Array.from(new Set(matches));
    })
    .catch((error) => {
      console.error(`couldn't retrieve cached scenes`, error);
      return [];
    });
}
