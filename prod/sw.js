/**
 * @fileoverview Service Worker for Santa Tracker.
 */

const swUrl = new URL(self.location);
const debug = false;

const isProd = !swUrl.searchParams.get('lang');
const lang = swUrl.searchParams.get('lang') || 'test';
const baseurl = swUrl.searchParams.get('baseurl');
const prodPrefix = `/intl/${lang}`;

console.info('SW', lang, baseurl);

const STATIC_VERSION_HEADER = 'X-Santa-Version';
const IGNORE_PROD = ['cast', 'error', 'upgrade'];
const IGNORE_STATIC_PREFIX = ['/audio/', '/scenes/'];

const PRECACHE = (function() {
  const out = {};

  // Cache the "intl" files as top-level files. While the user keeps making requests to this
  // language, we'll keep serving them. Otherwise, they'll get real files anyway.
  out['/index.html'] = `${prodPrefix}/index.html`;
  out['/error.html'] = `${prodPrefix}/error.html`;
  out['/manifest.json'] = `${prodPrefix}/manifest.json`;
  out['/loader.js'] = `/loader.js`;

  // cache images from Web App Manifest, top-level is fine
  const icons = [
    '/images/favicon-32.png',
    '/images/icon-192.png',
    '/images/icon-256.png',
    '/images/icon-512.png',
  ];
  icons.forEach((url) => out[url] = url);

  return out;
}());

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
    await Promise.all(Object.keys(PRECACHE).map(async (target) => {
      const url = PRECACHE[target];
      const response = await fetch(url);
      await prodCache.put(new Request(target), response.clone());
      console.info('precached', url);
      return response;
    }));

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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isProdRequest = (location.hostname === url.hostname);
  if (!isProdRequest) {
    if (!event.request.url.startsWith(baseurl)) {
      return;
    }

    const naked = event.request.url.substr(baseurl.length);
    const version = naked.split('/', 1)[0] || '';
    const rest = naked.substr(version.length).split('?')[0];  // starts with '/', remove "?-part"

    if (IGNORE_STATIC_PREFIX.some((x) => rest.startsWith(x))) {
      return;  // we're mostly here for the JS
    }

    // We'll only ever see requests for the "latest" version. Go to network, but fall back to cache.
    // Yes, if different entrypoint JS is cached, this could cause errors, but in theory the
    // 'unhashed' code only imports hashed code, which would be cached already.

    const call = async () => {
      const staticCache = await caches.open('static');

      const response = await staticCache.match(rest);
      if (response) {
        if (response.headers.get(STATIC_VERSION_HEADER) === version) {
          // This is a valid match that has our version. Hooray!
          debug && console.warn('! got OK asset', version, rest);
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

  let pathname = url.pathname.replace(/^\/intl\/.*?\//, '/');
  const routeMatch = pathname.match(/^\/(?:(\w+)\.html|)(\?|$)/);
  if (routeMatch && IGNORE_PROD.indexOf(routeMatch[1]) === -1) {
    pathname = '/index.html';
  }
  if (!(pathname in PRECACHE)) {
    return;  // PRECACHE is static, so just do a check early
  }

  const call = async () => {
    let response;
    try {
      response = await fetch(pathname);
    } catch (e) {
      const prodCache = await caches.open('prod');
      console.warn('FAILING, response from cache', pathname);
      return prodCache.match(pathname);
    }

    // Always write the response to prod cache again.
    const prodCache = await caches.open('prod');
    await prodCache.put(new Request(pathname), response.clone());
    return response;
  };
  event.respondWith(call());
});
