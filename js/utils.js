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

// Add Modernizr webaudio test since third_party version doesn't include it.
Modernizr.addTest('webaudio',
    !!(window.AudioContext || window.webkitAudioContext));

/**
 * Converts a Santa LatLng object to a Maps API LatLng.
 *
 * @param {LatLng} o
 * @return {google.maps.LatLng}
 */
function mapsLatLng(o) {
  return new google.maps.LatLng(o.lat, o.lng);
}

/**
 * Pads an integer to have two digits.
 * @param {number} n
 * @return {string}
 */
function padDigits(n) {
  if (n > 9) {
    return '' + n;
  }
  return '0' + n;
}


/**
 * Checks if the condition evaluates to true if window.DEV is true. If
 * window.DEV is false, assert call is removed by compiler as dead code.
 * @param {*} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @throws {Error} Assertion failed, the condition evaluates to false.
 */
function assert(condition, opt_message) {
  // TODO(bckenny): move DEV to JSCompiler --define
  if (window['DEV'] && !condition) {
    throw new Error('Assertion failed' +
        (opt_message ? ': ' + opt_message : ''));
  }
}

/**
 * Throttle calls to a function
 * @param {function()} func
 * @param {number} ms at most one per this many ms
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
