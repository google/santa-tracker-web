import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import messages from '../en_src_messages.json';

/**
 * @fileoverview Magic helpers for development. These should only be used as tagged templates and,
 * in production, are replaced with raw strings.
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