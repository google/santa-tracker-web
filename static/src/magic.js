import {unsafeHTML} from 'lit-html/directives/unsafe-html';
import messages from '../en_src_messages.json';

/**
 * @fileoverview Magic helpers for development. These should only be used as tagged templates and,
 * in production, are replaced with raw strings.
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

export function _root(path) {
  // TODO:
  return path;
}

// Closure-ified code can't import other module code. Put our magic helpers in the global scope.
Object.assign(window, {_msg, _root});
