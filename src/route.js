import * as dom from './lib/dom.js';

const simplePathMatcher = /^\/?(?:|(\w+)\.html)$/;

/**
 * @return {string} prod scope
 */
function determineScope() {
  const scope = document.body.getAttribute('data-scope');
  return scope || 'https://santatracker.google.com/';
}

/**
 * @param {!Event} ev to read from
 * @return {?string} found scene name based on scope
 */
export function fromClick(ev) {
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

/**
 * @param {string} cand candidate href
 * @return {string} href with scope as appropriate
 */
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
    return cand;  // give up
  }
}

/**
 * @param {string} sceneName
 * @return {string} public URL to scene name
 */
export function scene(sceneName) {
  const scope = determineScope();
  if (sceneName) {
    const url = new URL(`${sceneName}.html`, scope);
    return url.toString();
  }
  return scope;
}
