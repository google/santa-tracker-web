/**
 * @fileoverview Polyfills required for legacy browsers.
 */

import 'core-js/modules/es.array.from';
import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.object.assign';
import 'core-js/modules/es.promise';
import 'core-js/modules/es.string.ends-with';
import 'core-js/modules/es.string.includes';
import 'core-js/modules/es.string.starts-with';
import 'core-js/modules/es.symbol';
import 'core-js/modules/web.url-search-params';
import 'regenerator-runtime/runtime';

import './src/polyfill/classlist--toggle.js';
import './src/polyfill/element--closest.js';
import './src/polyfill/node.js';

// IE11 CustomEvent
if (typeof window.CustomEvent !== 'function') {
  function CustomEvent(name, params) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent(name, params.bubbles, params.cancelable, params.detail);
    return event;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
}

// IE11 Event
if (typeof window.Event !== 'function') {
  function Event(name, params) {
    params = params || {bubbles: false, cancelable: false, detail: undefined};
    const event = document.createEvent('Event');
    event.initEvent(name, params.bubbles, params.cancelable, params.detail);
    return event;
  }
  Event.prototype = window.Event.prototype;
  window.Event = Event;
}
