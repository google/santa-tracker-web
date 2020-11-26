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
 * @fileoverview Service Worker for Santa Tracker.
 */

const debug = false;

const swUrl = new URL(self.location);
const baseurl = swUrl.searchParams.get('baseurl') || '';

console.info('SW', baseurl);

const STATIC_VERSION_HEADER = 'X-Santa-Version';
const IGNORE_PROD = ['cast', 'error', 'upgrade'];
const IGNORE_STATIC_PREFIX = ['/audio/', '/scenes/'];
const PRECACHE = [
  '/',
  '/error.html',
  '/manifest.json',
  '/loader.js',
  '/images/favicon-32.png',
  '/images/icon-192.png',
  '/images/icon-256.png',
  '/images/icon-512.png',
];

let replacingPreviousServiceWorker = false;

self.addEventListener('install', (event) => {
  console.info('SW install');

  const call = async () => {
    // This is non-null if there was a previous Service Worker registered. Record for "activate", so
    // that a lack of current architecture can be seen as a reason to reload our clients.
    if (self.registration.active) {
      replacingPreviousServiceWorker = true;
    }

    const prodCache = await caches.open('prod');
    try {
      await Promise.all(PRECACHE.map((url) => prodCache.add(url)));
    } catch (e) {
      console.error('failed to fetch', e);
    }
    console.info('precached', PRECACHE.length, 'prod URLs');

    await self.skipWaiting();
  };
  event.waitUntil(call());
});

self.addEventListener('activate', (event) => {
  console.info('SW activate, replacing:', replacingPreviousServiceWorker);

  const call = async () => {
    // We can't use client.navigate here, as Safari doesn't support it. The 'controllerchange'
    // event in the foreground handles this.
    await self.clients.claim();
  };
  event.waitUntil(call());
});

function staticRequestPath(url) {
  if (!baseurl) {
    // do nothing, not prod
  } else if (baseurl.startsWith('/')) {
    // for staging on a single domain
    const u = new URL(url);
    if (u.hostname === location.hostname && u.pathname.startsWith(baseurl)) {
      return u.pathname.substr(baseurl.length);
    }
  } else if (url.startsWith(baseurl)) {
    return url.substr(baseurl.length);
  }
}

/**
 * @param {string} raw pathname
 * @return {{intl: string, pathname: string}}
 */
function splitProdPath(raw) {

  // get prefix, will be blank or e.g. "/intl/foo-BAR"
  const intlMatch = raw.match(/^(\/intl\/.*?)\//);
  const intlPrefix = intlMatch ? intlMatch[1] : '';

  let pathname = raw.substr(intlPrefix.length);
  const routeMatch = pathname.match(/^\/(?:(\w+)\.html|)(\?|$)/);
  if (routeMatch && !IGNORE_PROD.includes(routeMatch[1])) {
    pathname = '/';  // don't use /index.html, as our Go server redirects in staging (breaks Safari)
  }

  return {intl: intlPrefix, pathname};
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Don't check domain for static requests; in dev, it's the same domain.
  const naked = staticRequestPath(event.request.url);
  if (naked) {
    // read version/rest from "VERSION/REST/PATH/TO/FOO.png"
    const version = naked.split('/', 1)[0] || '';
    const rest = naked.substr(version.length).split('?')[0];  // starts with '/', remove "?-part"

    if (rest.startsWith('/scenes/')) {
      return;  // never cache scene assets (not sure how we got here)
    }
    const immutableHash = rest.startsWith('/audio/') || rest.startsWith('/fallback-audio/');

    // We'll only ever see requests for the "latest" version. Go to network, but fall back to cache.
    // Yes, if different entrypoint JS is cached, this could cause errors, but in theory the
    // 'unhashed' code only imports hashed code, which would be cached already.

    const call = async () => {
      const staticCache = await caches.open('static');

      const response = await staticCache.match(rest);
      if (response) {
        if (immutableHash || response.headers.get(STATIC_VERSION_HEADER) === version) {
          // This is a valid match that has our version. Hooray!
          debug && console.warn('! got OK asset', version, rest, 'immutable', immutableHash);
          return response;
        }
        // ... otherwise, try the network (but we have this to fall back to)
      }

      return fetch(event.request.url).then(async (response) => {
        if (response.status === 206) {
          return response;  // don't cache partial responses (Safari mostly)
        }

        // Clone the response, and store it with STATIC_VERSION_HEADER so we may not need to fetch
        // it again for this version in future.
        const init = {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(response.headers),
        };
        init.headers.set(STATIC_VERSION_HEADER, version);
        const cloneBuffer = await response.clone().arrayBuffer();
        const cacheResponse = new Response(cloneBuffer, init);
        await staticCache.put(new Request(rest), cacheResponse);
        debug && console.warn('! cached new asset', version, rest);

        return response;
      }).catch((err) => {
        // If the retry failed, but we still had a response, use it.
        debug && console.warn('! could not fetch asset', version, rest);
        if (response) {
          debug && console.warn('! but replying with old version', response.headers.get(STATIC_VERSION_HEADER), rest);
          return response;
        }
        throw err;  // ... or continue to explode
      });
    };
    event.respondWith(call());
    return;
  }

  const isProdRequest = (location.hostname === url.hostname);
  if (!isProdRequest) {
    return;  // static external resource, ignore
  }

  const {intl, pathname} = splitProdPath(url.pathname);
  if (!PRECACHE.includes(pathname)) {
    return;  // PRECACHE is static, so just do a check early
  }

  const call = async () => {
    let response;
    try {
      // fetch intl preference but fallback to whatever was last cached.
      response = await fetch(intl + pathname);
    } catch (e) {
      const prodCache = await caches.open('prod');
      return prodCache.match(pathname);
    }

    // Always write the response to prod cache again.
    const prodCache = await caches.open('prod');
    await prodCache.put(new Request(pathname), response.clone());
    return response;
  };
  event.respondWith(call());
});
