const CACHE_NAME = 'pwa-pacman-v1';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './css/pacman.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './game/bundle.js',
  './assets.json'
];

// Install Event: Cache base assets and dynamic sprites
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Caching base assets...');
      await cache.addAll(ASSETS);

      try {
        console.log('[Service Worker] Fetching dynamic sprites list...');
        const response = await fetch('./assets.json');
        const sprites = await response.json();
        console.log('[Service Worker] Caching sprites:', sprites);
        await cache.addAll(sprites);
      } catch (error) {
        console.error('[Service Worker] Failed to fetch dynamic sprites list:', error);
      }
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-First strategy with Network Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

