
/**
 * @fileoverview Route helpers designed for static scope only.
 *
 * TODO: can also be used by prod.
 */

function determineScope() {
  if (window.top != window && document.referrer) {
    const u = new URL('./', document.referrer);
    return u.toString();
  }
  return '';
}

export const scope = determineScope();

const emptyFunc = (a) => a;

/**
 * @param {string} cand candidate href
 * @return {string} href with scope as appropriate
 */
export const href = scope ? (cand) => {
  return cand == null ? cand : new URL(cand, scope);
} : emptyFunc;

/**
 * Rectify anything found under the passed element, that has a `[href]`.
 *
 * @param {!Element} el to rectify links under
 */
export const rectify = scope ? (el) => {
  const hrefs = el.querySelectorAll('[href]');
  for (let i = 0; i < hrefs.length; ++i) {
    const c = hrefs[i];
    const url = href(c.getAttribute('href'));
    c.setAttribute('href', url.toString());
  }
} : emptyFunc;

/**
 * @param {string} htmlString raw HTML to resolve containing e.g. <a href="scene.html">
 * @return {!DocumentFragment}
 */
export const resolve = (htmlString) => {
  const node = document.createElement('template');
  node.innerHTML = htmlString;
  rectify(node);  // noop without scope
  return node.content;
};
