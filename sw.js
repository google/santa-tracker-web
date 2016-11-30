/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Service Worker for Santa Tracker.
 */

const VERSION = '<STATIC_VERSION>';
const STATIC_HOST = '<STATIC_HOST>';
const IS_STAGING = location.hostname !== 'santatracker.google.com';

if (VERSION.startsWith('<STATIC')) {  // don't use whole, prevent replacing
  // Don't enable the SW on environments without versions.
  throw new Error('sw disabled without build');
}

const MANIFEST = `${STATIC_HOST}${VERSION}/contents.json`;
const LANGUAGE = new URL(self.location).searchParams.lang || 'en';
const STATIC_DOMAINS = ['maps.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

const MATCH_INTL_PATH = new RegExp(/^\/intl\/([^/]+)(?:\/(.*)|)$/);

const PRECACHE = (function() {
  const prod = (self.location.hostname === 'santatracker.google.com');
  const prefix = (function() {
    if (!prod && LANGUAGE == 'en') {
      // In staging, /intl/en_ALL/ won't return anything. Just use top-level.
      return '/';
    }
    return '/intl/' + LANGUAGE + (prod ? '_ALL' : '');
  }());

  const out = {};

  // Cache the "intl" files as top-level files. While the user keeps making requests to this
  // language, we'll keep serving them. Otherwise, they'll get real files anyway.
  out['/'] = `${prefix}/somebodypleasethinkofthechildren.html`;
  out['/error.html'] = `${prefix}/error.html`;
  out['/manifest.json'] = `${prefix}/manifest.json`;

  // cache images from Web App Manifest, top-level is fine
  const sizes = [16, 32, 76, 120, 152, 192, 256];
  sizes.forEach(size => {
    const url = `/images/${size <= 32 ? 'fav' : ''}icon-${size}.png`;
    out[url] = url;
  });

  return out;
}());

/**
 * Fetches a url and adds it to the cache.
 * @param {string|Request} url
 * @param {string=} opt_cacheUrl the optional target cache URL
 * @param {boolean=} opt_withCredentials
 * @returns {Promise<Response>}
 */
function fetchAndCache(url, opt_cacheUrl, opt_withCredentials) {
  const cacheUrl = opt_cacheUrl || url;
  const opts = {};
  if (opt_withCredentials) {
    opts.mode = 'cors';
    opts.credentials = 'include';
  }
  return fetch(url, opts).then(response => {
    if (response.status === 200) {
      if (cacheUrl !== url) {
        // console.debug(`Adding ${url} to cache, as ${cacheUrl}`);
      } else {
        // console.debug(`Adding ${url} to cache.`);
      }
      caches.open(VERSION).then(cache => cache.put(new Request(cacheUrl), response));
    }
    return response.clone();
  });
}

/**
 * Loads a url from cache, or adds it if it wasn't previously cached.
 * @param {string|Request} url
 * @param {string=} opt_cacheUrl the optional target cache URL
 * @param {boolean=} opt_withCredentials
 * @returns {Promise<Response>}
 */
function loadFromCache(url, opt_cacheUrl, opt_withCredentials) {
  return caches.open(VERSION)
    .then(cache => cache.match(opt_cacheUrl || url))
    .then(response => response || fetchAndCache(url, opt_cacheUrl, opt_withCredentials));
}

/**
 * Returns the manifest corresponding to the currently active service worker.
 * If there's no current manifest, returns an empty Object.
 * @returns {Promise<Object>}
 */
function getOldManifest() {
  return caches.open('persistent')
    .then(cache => cache.match('/manifest.json'))
    .then(response => response ? response.json() : {});
}

/**
 * Returns the manifest corresponding to this service worker.
 * @returns {Promise<Object>}
 */
function getNewManifest() {
  return loadFromCache(MANIFEST).then(response => response.json())
}

/**
 * Returns true if a URL should be cached. It excludes internationalised files
 * from other languages.
 * @param {string} url
 * @returns {boolean}
 */
function shouldCache(url) {
  return !url.match(/_\w\w(-\w+)?\.html$/) ||
    url.match(new RegExp(`_${LANGUAGE}.html$`));
}

/**
 * Returns an array of all scene IDs (e.g., dorf, boatload) cached in a specific
 * cache instance.
 * @param {Cache} cache
 * @returns {Promise<Array<string>>}
 */
function getScenes(cache) {
  return cache.keys().then(requests => {
    const matches = requests.map(r => r.url.match(/\/scenes\/(\w+)\//));
    return [...new Set(matches.filter(m => m).map(m => m[1]))];
  });
}

function compareScene(oldScene, newScene, oldCache, newCache, oldVersion) {
  if (!oldScene || !newScene) { return; }

  let oldHashes = {};
  for (let path in oldScene) {
    oldHashes[oldScene[path]] = `${STATIC_HOST}${oldVersion}/${path}`;
  }

  return Promise.all(Object.keys(newScene).map(path => {
    const url = `${STATIC_HOST}${VERSION}/${path}`;
    if (newScene[path] in oldHashes) {
      // Copy an existing response from the old cache.
      return oldCache.match(oldHashes[newScene[path]]).then(match => {
        if (match) { return newCache.put(url, match); }
      });
    } else if (shouldCache(url)) {
      // Add a new response.
      return newCache.add(url);
    }
  }));
}

/**
 * Compares the content of two manifests and updates all scenes that were
 * previously cached.
 * @param oldManifest
 * @param newManifest
 * @returns {Promise}
 */
function compareManifest(oldManifest, newManifest) {
  return Promise.all([caches.open(oldManifest.version), caches.open(VERSION)])
    .then(([oldCache, newCache]) => {
      return getScenes(oldCache).then(scenes => {
        console.debug('Updating cache for', scenes);

        const sharedPromise = compareScene(oldManifest.shared,
          newManifest.shared, oldCache, newCache, oldManifest.version);

        const scenePromises = scenes.map(s => {
          return compareScene(oldManifest.scenes[s], newManifest.scenes[s],
            oldCache, newCache, oldManifest.version);
        });

        return Promise.all([sharedPromise, ...scenePromises]);
      });
    });
}

/**
 * Precaches all content in a given scene (for the current language).
 * @param scene
 * @returns {Promise}
 */
function precacheScene(scene) {
  const paths = Object.keys(scene).filter(shouldCache);
  return Promise.all(paths.map(path => {
    return fetchAndCache(`${STATIC_HOST}${VERSION}/${path}`);
  }));
}

self.addEventListener('install', function(event) {
  console.debug('sw install', VERSION, LANGUAGE);

  const updatePromise = Promise.all([getOldManifest(), getNewManifest()])
    .then(function([oldManifest, newManifest]) {
      // This is an install event, so always compare manifests, even if they may be the same.
      if (oldManifest.version) {
        return compareManifest(oldManifest, newManifest);
      }
      // TODO(samthor): This should cache village (aka dorf).
      return precacheScene(newManifest.shared);
    });

  // nb. We fetch PRECACHE with credentials to support Santa's staging server.

  const precacheRequests = Object.keys(PRECACHE).map(cacheUrl => {
    const url = PRECACHE[cacheUrl];  // actually fetched URL
    return loadFromCache(url, cacheUrl, true);
  });
  const precachePromise = Promise.all(precacheRequests);

  // TODO(samthor): Why skip in staging?
  // if (IS_STAGING) {
  //   event.waitUntil(self.skipWaiting());
  //   return;
  // }
  event.waitUntil(Promise.all([updatePromise, precachePromise]));
});

self.addEventListener('activate', function(event) {
  console.debug('sw activate', VERSION, LANGUAGE);
  
  const activatePromise = Promise.all([getOldManifest(), getNewManifest()])
    .then(function([oldManifest, newManifest]) {
      // If necessary, remove the old cache (can be asynchronous).
      if (oldManifest.version && oldManifest.version !== newManifest.version) {
        console.debug('sw deleting cache', oldManifest.version);
        caches.delete(oldManifest.version);
      }

      // Move the current manifest into the persistent cache
      return caches.open('persistent').then(persistentCache => {
        return loadFromCache(MANIFEST).then(response => {
          return persistentCache.put('/manifest.json', response);
        });
      });
    });

  // In staging, we activate the service worker immediately and claim all curent
  // clients. The main thread listens to this event and refreshes the page.
  // Updating and clearing the caches will still happen in the background.
  if (IS_STAGING) {
    event.waitUntil(activatePromise.then(_ => self.clients.claim()));
  } else {
    event.waitUntil(activatePromise);
  }
});

/**
 * Returns the cache URL for the specified prod request. Returns undefined if this should not be
 * handled.
 * @param {string} pathname
 * @param {string} lang
 * @return {string|undefined}
 */
function urlForProd(pathname, lang) {
  const intl = MATCH_INTL_PATH.exec(pathname);
  if (intl) {
    lang = intl[1];
    pathname = intl[2] || '/';  // can be undefined if "/intl/de"
  }

  if (lang && lang !== LANGUAGE) {
    // If the language doesn't match, then defer to the network. We don't care ¯\_(ツ)_/¯
    // But don't worry if there's no language: serve whatever is in cache.
    console.debug('ignoring request for lang', lang, 'sw registered for', LANGUAGE);
    return;
  }

  if (pathname === '/' || pathname.endsWith('.html')) {
    if (pathname.lastIndexOf('/') > 0) {
      return;  // could be e.g. "/foo/bar.html", ignore
    }
    // TODO(samthor): We could limit to actual fanned out routes here.
    switch (pathname) {
    case '/upgrade.html':
    case '/cast.html':
      return;  // don't cache cast or upgrade
    case '/error.html':
      return pathname;  // serve error properly (used for kill switch)
    }
    return '/';  // this is a route, return generic index page
  }

  // Allow other top-level files, or anything under /images.
  if (pathname.lastIndexOf('/') === 0 || pathname.startsWith('/images/')) {
    return pathname;
  }

  // Everything else goes through to the network.
}

self.addEventListener('fetch', function(event) {
  // Only handle GET requests.
  if (event.request.method != 'GET') { return; }

  const url = new URL(event.request.url);

  // Look for static requests, and only intercept requests to permitted domains. This excludes
  // santa-api.appspot.com and ssl.google-analytics.com, among others.
  // STATIC_HOST should not match the prod domain (it should be longer). STATIC_DOMAINS will never
  // include STATIC_HOST.
  const urlIsMatched = event.request.url.startsWith(STATIC_HOST) ||
      STATIC_DOMAINS.includes(url.hostname);
  if (urlIsMatched) {
    event.respondWith(loadFromCache(event.request.url));
    return;
  }

  // Otherwise, this is probably a prod request: to the domain of the SW itself.
  if (url.hostname === self.location.hostname) {
    let hlLang = null;
    if (url.search) {
      const match = /\bhl=([^&]*)\b/;
      if (match) {
        hlLang = match[1];
      }
    }
    const cacheUrl = urlForProd(url.pathname, hlLang);
    if (cacheUrl) {
      event.respondWith(loadFromCache(url.pathname, cacheUrl, true));
    }
    return;
  }

  // TODO(plegner) Add catch handlers, to provide offline fallback responses.
});
