import * as dom from './lib/dom.js';

const simplePathMatcher = /^\/?(?:|(\w+)\.html)$/;


const {scope, hasScope, scopeLang} = (() => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('_scope');
  const scope = raw || 'https://santatracker.google.com';
  const m = /\/intl\/([-\w+])/.exec(scope);
  const scopeLang = m ? m[1] : '';
  return {scope, scopeLang, hasScope: Boolean(raw)};
})();


const loaderSuffix = document.documentElement.lang ? `${document.documentElement.lang}.html` : '';


/**
 * @param {string} scene to load, including e.g. _video
 * @param {!Object<string, string>=} params to set on URLSearchParams
 * @return {string}
 */
export function buildIframeUrl(scene, params={}) {
  if (scene === null || scene === 'index') {
    return 'data:text/html;base64,';
  }
  const p = new URLSearchParams();
  for (const k in params) {
    p.set(k, params[k]);
  }
  if (hasScope) {
    p.set('_scope', scope);
  }
  const s = p.toString();
  return `./scenes/${scene || 'index'}/${loaderSuffix}` + (s ? `?${s}` : '');
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
  if (cand == null) {
    return cand;
  }

  try {
    const url = new URL(cand);
    return url.toString();
  } catch (e) {
    // not a URL, probably a scene
  }
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
  if (scopeLang) {
    const u = new URL(url);
    u.searchParams.set('hl', scopeLang);
    return u.toString();
  }
  return url;
}


/**
 * @param {?string} language to load, null for default
 * @param {string=} sceneName to load
 * @return {string} public URL to scene name
 */
export function intl(lang, sceneName='') {
  let out = scope;
  if (lang) {
    out += `intl/${lang}/`;
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
