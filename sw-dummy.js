self.addEventListener('install', (e) => {
  console.log("Installed dummy service worker");
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method != 'GET') { return; }

  const url = new URL(e.request.url);

  if (url.pathname === '/village.html') {
    console.debug('generating test redirect');
    e.respondWith(Response.redirect('./', 302));
  }
});
