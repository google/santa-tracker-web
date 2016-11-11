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

const MANIFEST = `${STATIC_HOST}${VERSION}/contents.json`;
const LANGUAGE = new URL(self.location).searchParams.lang || 'en';

const PRECACHE = (function() {
  // Cache both the top-level files and the /intl/xx/-rooted files. If the user has chosen a lang
  // manually, then these files will differ. Loading the top-level in future will cause a new SW
  // to be installed.
  // TODO(plegner): Will that experience while offline be broken? Should we instead explicitly
  // _not_ cache the  top-level if a language has been explicitly chosen, because we won't work?

  const r = ['/', '/error.html'];

  // cache images from Web App Manifest
  const sizes = [16, 32, 76, 120, 152, 192, 256];
  r.push(...sizes.map(size => `/images/${size <= 32 ? 'fav' : ''}icon-${size}.png`));

  const prod = (self.location.hostname === 'santatracker.google.com');
  const prefix = `/intl/${LANGUAGE}${(prod ? '' : '_ALL')}/`;
  r.push(prefix + 'index.html', prefix + 'error.html')
  return r;
}());



/**
 * Fetches a url and adds it to the cache.
 * @param {string|Request} url
 * @param {boolean=} opt_withCredentials
 * @returns {Promise<Response>}
 */
function fetchAndCache(url, opt_withCredentials) {
  const opts = {};
  if (opt_withCredentials) {
    opts.credentials = 'include';
  }
  return fetch(url, opts).then(response => {
    if (response.status === 200) {
      console.debug(`Adding ${url} to cache.`);
      caches.open(VERSION).then(cache => cache.put(url, response));
    }
    return response.clone();
  });
}

/**
 * Loads a url from cache, or adds it if it wasn't previously cached.
 * @param {string|Request} url
 * @param {boolean=} opt_withCredentials
 * @returns {Promise<Response>}
 */
function loadFromCache(url, opt_withCredentials) {
  return caches.open(VERSION)
    .then(cache => cache.match(url))
    .then(response => response || fetchAndCache(url, opt_withCredentials));
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
        console.debug('Updating cache for: ' + scenes.join(', '));

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
  console.debug(`Installing new service worker (${VERSION}).`);

  const updatePromise = Promise.all([getOldManifest(), getNewManifest()])
    .then(function([oldManifest, newManifest]) {
      // TODO(plegner) This check doesn't work if the language changes.
      if (oldManifest.version === newManifest.version) {
        return Promise.resolve();
      } else if (oldManifest.version) {
        compareManifest(oldManifest, newManifest);
      } else {
        precacheScene(newManifest.shared);
      }
    });

  // nb. We fetch PRECACHE with credentials to support Santa's staging server.
  const precachePromise = Promise.all(PRECACHE.map(path => loadFromCache(path, true)));

  event.waitUntil(Promise.all([updatePromise, precachePromise]));
});

self.addEventListener('activate', function(event) {
  console.debug(`Activating new service worker (${VERSION}).`);
  event.waitUntil(getOldManifest().then(oldManifest => {
    // If necessary, remove the old cache (can be asynchronous).
    if (oldManifest.version) {
      console.debug(`Deleting old cache (${oldManifest.version})`);
      caches.delete(oldManifest.version);
    }

    // Move the current manifest into the persistent cache
    return caches.open('persistent').then(persistentCache => {
      return loadFromCache(MANIFEST).then(response => {
        return persistentCache.put('/manifest.json', response);
      });
    });
  }));
});

self.addEventListener('fetch', function(event) {
  // Don't intercept POST requests.
  if (event.request.method != 'GET') { return; }

  // Only intercept requests to gstatic (or the current host).
  let url = new URL(event.request.url);
  if (url.hostname != 'localhost' && url.host != 'maps.gstatic.com') { return; }

  // Don't cache audio resources (for now).
  if (event.request.url.match(/\/audio\//)) { return; }

  // TODO(plegner) Add catch handlers, to provide offline fallback responses.
  event.respondWith(loadFromCache(event.request.url));
});
