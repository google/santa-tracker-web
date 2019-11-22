/**
 * @fileoverview Polyfills required for legacy browsers.
 */

// nb. webcomponents-loader polyfills:
//   * Array.from
//   * Object.assign
//   * Promise
//   * Symbol

import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.string.starts-with';
import 'core-js/modules/es.string.ends-with';
import 'core-js/modules/es.string.includes';
import 'core-js/modules/web.url-search-params';
import 'whatwg-fetch';
import 'regenerator-runtime/runtime';

import './src/polyfill/classlist--toggle.js';
import './src/polyfill/element--closest.js';
import './src/polyfill/node.js';

