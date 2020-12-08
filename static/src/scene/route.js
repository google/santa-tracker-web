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


/**
 * @fileoverview Route helpers designed for static scope only.
 *
 * TODO: can also be used by prod.
 */

function guessProdUrl() {
  let params;
  try {
    // Scenes are passed this param in referrer=.
    params = new URLSearchParams(window.location.search);
  } catch (e) {
    // ignore
  }
  if (params && params.has('referrer')) {
    return params.get('referrer');
  }
  return document.referrer;
}

function determine() {
  const referrer = guessProdUrl();

  if (window.top != window && referrer) {
    const scope = new URL('./', referrer);
    return {
      scope: scope.toString(),
      page: referrer,
    };
  }
  const scope = new URL('./', window.location);
  return {scope: scope.toString(), page: window.location.href};
}

export const {scope, page} = determine();

export const internalNavigation = (cand) => {
  const check = new URL(cand);
  const derived = new URL(check.hash, page);
  return check.toString() === derived.toString() ? check.hash : null;
};

/**
 * @param {string} cand candidate href
 * @return {string} href with scope as appropriate
 */
export const href = (cand) => {
  return cand == null ? cand : new URL(cand, page);
};

/**
 * @param {string} sceneName
 * @return {string} href with scope as appropriate
 */
export const hrefForScene = (sceneName) => {
  if (sceneName) {
    return href(sceneName + '.html');
  }
  return href('./');
};

/**
 * Rectify anything found under the passed element, that has a `[href]`.
 *
 * @param {!Element} el to rectify links under
 */
export const rectify = (el) => {
  const hrefs = el.querySelectorAll('[href]');
  for (let i = 0; i < hrefs.length; ++i) {
    const c = hrefs[i];
    const url = href(c.getAttribute('href'));
    c.setAttribute('href', url.toString());
  }
};

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
