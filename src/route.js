import * as dom from './lib/dom.js';
import {scope} from './lib/location.js';

export function fromUrl(cand) {
  if (cand === null) {
    return null;
  } else if (scope.origin !== cand.origin) {
    return null;  // different origin
  } else if (!cand.pathname.startsWith(scope.pathname)) {
    return null;  // different dir
  }
  const test = cand.pathname.substr(scope.pathname.length);
  const m = /^(?:|(\w+)\.html)$/.exec(test);
  return m && m[1] || '';
}

export function fromClick(ev) {
  const url = dom.urlFromClickEvent(ev);
  return fromUrl(url);
}

export function urlFromRoute(route) {
  return new URL(route ? `./${route}.html` : './', scope);
}
