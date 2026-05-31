const CACHE_NAME = 'pwa-pacman-v2';
const DYNAMIC_CACHE_NAME = 'pwa-dynamic-v2';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './css/pacman.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './favicon.ico',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
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
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});


// Fetch Event: Cache-First strategy with General Dynamic Caching
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Only cache HTTP/HTTPS requests
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. If it's already in the cache, serve it
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Otherwise, fetch it from the network and cache it dynamically
      return fetch(event.request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.error('[Service Worker] Fetch failed:', err);
      });
    })
  );
});



