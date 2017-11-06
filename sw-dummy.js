self.addEventListener('install', (e) => {
  console.log("Installed dummy service worker");
});

self.addEventListener('fetch', (e) => {});
