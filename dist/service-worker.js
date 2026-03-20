const CACHE_NAME = 'scouting-app-cache-v1';
const urlsToCache = [
  './',                   // root of the app
  './index.html',          // main HTML
  './js/index.js',
    './js/scanner.js',
    './js/Pit-scouting.js',
  './css/style.css',       // your CSS
  // add other files like images/icons
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});