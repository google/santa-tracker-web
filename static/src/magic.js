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

import {join} from './lib/url.js';

let messages = {};

function resolveCurrentLang() {
  if (typeof window !== 'undefined') {
    // 1. Explicit /intl/<lang>/ path
    const fromPath = (window.location.pathname.match(/\/intl\/([a-zA-Z-]+)/) || [])[1];
    if (fromPath) return fromPath;

    // 2. Query param ?hl= or ?lang=
    const fromQuery = (window.location.search.match(/[?&](?:hl|lang)=([a-zA-Z-]+)/) || [])[1];
    if (fromQuery) return fromQuery;
  }

  // 3. documentElement.lang set by server
  if (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) {
    const docLang = document.documentElement.lang.trim();
    if (docLang) return docLang;
  }

  if (typeof window !== 'undefined') {
    // 4. Saved language cookie
    const fromCookie = (document.cookie.match(/santa-lang=([a-zA-Z-]+)/) || [])[1];
    if (fromCookie) return fromCookie;
  }

  // 5. Browser language (navigator.languages / navigator.language)
  if (typeof navigator !== 'undefined') {
    const navLangs = navigator.languages || [navigator.language || navigator.userLanguage];
    const supported = [
      'af', 'bg', 'ca', 'da', 'de', 'el', 'en-GB', 'en', 'es-419', 'es', 'et', 'eu', 'fi',
      'fr-CA', 'fr', 'gl', 'hi', 'hr', 'hu', 'id', 'is', 'it', 'ja', 'ko', 'lt', 'lv',
      'ml', 'nl', 'no', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv',
      'ta', 'th', 'tl', 'uk', 'vi', 'zh-CN', 'zh-HK', 'zh-TW'
    ];
    for (const raw of navLangs) {
      if (!raw) continue;
      const lower = raw.toLowerCase().replace(/_/g, '-');
      for (const l of supported) {
        if (l.toLowerCase() === lower) return l;
      }
      const base = lower.split('-')[0];
      for (const l of supported) {
        if (l.toLowerCase() === base) return l;
      }
      for (const l of supported) {
        if (l.toLowerCase().startsWith(base + '-')) return l;
      }
    }
  }

  return 'it';
}

const activeLang = resolveCurrentLang();
try {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', new URL(`../:messages.json?lang=${activeLang}`, import.meta.url).href, false);
  xhr.send(null);
  if (xhr.status === 200) {
    messages = JSON.parse(xhr.responseText);
  }
} catch (e) {
  console.warn('Failed to load synchronous messages for', activeLang, e);
}

/**
 * @fileoverview Magic helpers for development. These should only be used as tagged templates and,
 * in production, are replaced with raw strings.
 *
 * These have matching externs in build/transpile/externs.js, for our Closure code.
 */

 /**
  * Returns the development string for Santa Tracker in the active language.
  *
  * @param {string} id of message
  * @return {string|?} resulting text of message
  */
export function _msg(id) {
  const data = messages[id.toString()];
  return data && (data.raw || data.message) || '?';
}

/**
 * Returns the given path under Santa Tracker's static serving path.
 *
 * @param {string} path to join to static
 * @return {string} resolved path
 */
export function _static(path) {
  // FIXME: we're hoping that a compile can do something with `import.meta.url`.
  return join(import.meta.url, '..', path.toString());
}


/**
 * Upgrades all elements with `msgid="..."` as a single startup task. This is compiled for release
 * and we don't expect to see any inside Shadow DOM (should use `_msg`).
 *
 * This makes this file have side effects. This is probably fine.
 */
(function() {
  function upgrade(el) {
    if (el.localName === 'i18n-msg') {
      if (el.textContent !== 'PLACEHOLDER_i18n') {
        console.warn('i18n-msg with bad text', el.textContent)
      }
    } else if (el.childNodes.length) {
      console.warn('[msgid] with childNodes', el);
    }

    if (document.head.contains(el)) {
      // Don't do anything. It's not really worth testing anything here, just for release.
      return;
    }

    el.innerHTML = _msg(el.getAttribute('msgid'));
  }

  Array.from(document.body.querySelectorAll('[msgid]')).map(upgrade);
}());
