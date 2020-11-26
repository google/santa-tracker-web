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


/**
 * Determines load type. Santa Tracker supports modern browsers like Chrome (and Chromium-based
 * browsers), Firefox and Safari. We load a fallback environment (and polyfills) if the browser
 * does not hit minimum standards.
 *
 * @return {boolean} whether to load fallback environment
 */
export default function() {
  try {
    if (!('ShadowRoot' in window)) {
      throw 'Shadow DOM';
    }
    if (!('customElements' in window)) {
      throw 'Custom Elements';
    }
    if (!CSS.supports("(--foo: red)")) {
      // need CSS variable support for most modern scenes and the modern entrypoint
      throw 'CSS Variables';
    }
    if (!('noModule' in HTMLScriptElement.prototype)) {
      // modern code is loaded as modules
      throw '<script type="module">';
    }
    if (!('URLSearchParams' in window)) {
      // stops IE11
      throw 'URLSearchParams';
    }
    if (!('Symbol' in window)) {
      // stops IE11
      throw 'Symbol';
    }
    if (!('includes' in String.prototype && 'startsWith' in String.prototype && 'includes' in Array.prototype && 'from' in Array)) {
      // stops IE11 and browsers without standard niceities
      throw 'arraylike helpers';
    }
    if (!('append' in document.head)) {
      // friendly node helpers (nb. do NOT use 'body', doesn't exist yet)
      throw 'append';
    }
  } catch (e) {
    console.warn('loading fallback, failure:', e);
    return true;
  }

  return false;
}
