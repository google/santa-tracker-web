import * as dom from './lib/dom.js';

const simplePathMatcher = /^\/?(?:|(\w+)\.html)$/;


function determineScope() {
  const scope = document.body.getAttribute('data-scope');
  return scope || 'https://santatracker.google.com/';
}


export function fromClick(ev) {
  debugger;
  const url = dom.urlFromClickEvent(ev);
  if (url === null) {
    return null;
  }

  const check = url.origin + url.pathname;
  const scope = determineScope();
  if (!check.startsWith(scope)) {
    return null;
  }

  const tail = check.substr(scope.length);
  const m = simplePathMatcher.exec(tail);
  if (!m) {
    return null;
  } else if (m[1] === 'index') {
    return '';
  } else {
    return m[1] || '';
  }
}

export function href(cand) {
  try {
    const url = new URL(cand);
    return url.toString();
  } catch (e) {
    // not a URL, probably a scene
  }
  const scope = determineScope();
  try {
    const url = new URL(cand, scope);
    return url.toString();
  } catch (e) {
    // ???
  }
  return cand;  // totally give up
}

export function scene(sceneName) {
  const scope = determineScope();
  if (sceneName) {
    const url = new URL(`${sceneName}.html`, scope);
    return url.toString();
  }
  return scope;
}
