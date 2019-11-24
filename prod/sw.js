/**
 * @fileoverview Service Worker for Santa Tracker.
 */

const isProd = (self.location.hostname === 'santatracker.google.com');

//const MANIFEST = `${STATIC_HOST}${VERSION}/contents.json`;
const LANGUAGE = new URL(self.location).searchParams.lang || 'en';
const STATIC_DOMAINS = ['maps.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

const MATCH_INTL_PATH = new RegExp(/^\/intl\/([^/]+)(?:\/(.*)|)$/);

const PRECACHE = (function() {
  const prefix = (function() {
    if (!isProd && LANGUAGE == 'en') {
      // In staging, /intl/en_ALL/ won't return anything. Just use top-level.
      return '/';
    }
    return '/intl/' + LANGUAGE + (isProd ? '_ALL' : '');
  }());

  const out = {};

  // Cache the "intl" files as top-level files. While the user keeps making requests to this
  // language, we'll keep serving them. Otherwise, they'll get real files anyway.
  out['/'] = `${prefix}/index.html`;
  out['/error.html'] = `${prefix}/error.html`;
  out['/manifest.json'] = `${prefix}/manifest.json`;

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

/**
 * Returns the manifest corresponding to the currently active service worker.
 * If there's no current manifest, returns an empty Object.
 *
 * @returns {Promise<Object>}
 */
async function getOldManifest() {
  const cache = await caches.open('persistent');
  const response = await cache.match('/manifest.json');
  return response ? response.json() : {};
}

let replacingPreviousServiceWorker = false;

self.addEventListener('install', (event) => {
  const call = async () => {
    // This is non-null if there was a previous Service Worker registered. Record for "activate", so
    // that a lack of current architecture can be seen as a reason to reload our clients.
    if (self.registration.active) {
      replacingPreviousServiceWorker = true;
    }

    await self.skipWaiting();
  };
  event.waitUntil(call());
});

self.addEventListener('activate', (event) => {
  const call = async () => {
    await self.clients.claim();

    // Reload all open pages (includeUncontrolled shouldn't be needed as we've _just_ claimed
    // clients, but include it anyway for sanity).
    const windowClients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: 'window',
    });

    // It's impossible to 'await' this navigation because this event would literally be blocking
    // our fetch handlers from running. These navigates must be 'fire-and-forget'.
    windowClients.map((client) => client.navigate(client.url));
  };
  event.waitUntil(call());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  // TODO: ...
});
