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


/**
 * @param {string} url to localize
 * @return {string} localized url
 */
export function localize(url) {
  // TODO(samthor): This should optionally add ?hl=LANG.
  return url;
}


/**
 * @param {?string} language to load, null for default
 * @param {string=} sceneName to load
 * @return {string} public URL to scene name
 */
export function intl(lang, sceneName='') {
  const scope = determineScope();

  let out = scope;
  if (lang) {
    const suffix = (scope === 'santatracker.google.com' ? '' : '_ALL');
    out += `intl/${lang}${suffix}/`;
  }
  if (sceneName) {
    out += `${sceneName}.html`;
  }
  return out;
}


const resolveCache = {};

/**
 * @param {string} htmlString raw HTML to resolve containing e.g. <a href="scene.html">
 * @return {!DocumentFragment}
 */
export function resolve(htmlString) {
  const previous = resolveCache[htmlString];
  if (previous !== undefined) {
    return previous;
  }

  const node = document.createElement('template');
  node.innerHTML = htmlString;

  const links = Array.from(node.content.querySelectorAll('a[href]'));
  links.forEach((link) => {
    const v = href(link.getAttribute('href'));
    link.setAttribute('href', v);
  });

  resolveCache[htmlString] = node.content;
  return node.content;
}
