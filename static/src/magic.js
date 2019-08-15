import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import messages from '../en_src_messages.json';

/**
 * @fileoverview Magic helpers for development. These should only be used as tagged templates and,
 * in production, are replaced with raw strings.
 *
 * These have matching externs in build/transpile/externs.js, for our Closure code.
 */

 /**
  * Returns the English development string for Santa Tracker.
  *
  * @param {string} id of message
  * @return {string|?} resulting text of message
  */
export function _msg(id) {
  const data = messages[id];
  if (!data) {
    // do nothing
  } else if (data.raw) {
    // FIXME(samthor): This means that Closure code might end up with Lit-annotated clases. There
    // should probably be a lit-vs-normal mode for fetching strings.
    return unsafeHTML(data.raw);
  } else if (data.message) {
    return data.message;
  }

  return '?';
}

/**
 * Returns the given path under Santa Tracker's static serving path.
 *
 * @param {string} path to join to static
 * @return {string} resolved path
 */
export function _static(path) {
  // FIXME: we're hoping that a compile can do something with `import.meta.url`.
  return join(import.meta.url, '..', path);
}

/**
 * Joins the given URL and any following paths. This is magic in that with entirely static params
 * (including import.meta.url) it could be compiled out.
 *
 * @param {string|!URL} url to start with
 * @param  {...string} paths to append
 */
export function join(url, ...paths) {
  let u = new URL(url);

  while (paths.length) {
    const next = paths.shift();
    u = new URL(next, u);
  }

  // FIXME: It's not clear what domain this loads from, so just return the whole URL.
  return u.toString();
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
    } else if (el.childNodes) {
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
