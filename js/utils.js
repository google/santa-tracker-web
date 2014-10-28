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
 * Non-operation.
 * @type {Function}
 */
function noop() {}

/**
 * Re-triggers a given event on one object to another.
 *
 * @param {Object} origin the object where the event originates.
 * @param {string} eventName the event name.
 * @param {Object} target the object to trigger the event.
 * @return {google.maps.MapsEventListener}
 */
function forwardMapsEvent(origin, eventName, target) {
  return origin.addListener(eventName,
      google.maps.event.trigger.bind(this, target, eventName));
}

/**
 * Pads an integer to have two digits.
 * @param {number} n
 * @return {string|number}
 */
function pad(n) {
  if (n > 9) {
    return n;
  }
  return '0' + n;
}

/**
 * Formats a number according to user's locale.
 * @param {number} n
 * @return {string}
 */
function formatInt(n) {
  if (n < 1000) {
    return n.toFixed(0);
  }
  var s = n.toFixed(0);
  var ret = '';
  while (s.length > 3) {
    var l = s.length - 3;
    ret = s.slice(l) + (ret ? formatInt.sep : '') + ret;
    s = s.slice(0, l);
  }
  return ret = s + formatInt.sep + ret;
}
formatInt.sep = (.1).toLocaleString().indexOf(',') != -1 ? '.' : ',';

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
 * Shim for Element.textContent.
 * @type {function(Element, string)}
 */
var setText = (function() {
  if ('textContent' in document) {
    return function(el, text) {
      el.textContent = text;
    };
  } else {
    return function(el, text) {
      el.innerText = text;
    };
  }
})();

/**
 * Shim for window.innerWidth
 * @return {number}
 */
function windowWidth() {
  return window.innerWidth || document.documentElement.clientWidth;
}

/**
 * Shim for window.innerHeight
 * @return {number}
 */
function windowHeight() {
  return window.innerHeight || document.documentElement.clientHeight;
}
