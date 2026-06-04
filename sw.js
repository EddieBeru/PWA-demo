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

// Evento de instalación: Cachear los activos base y la lista dinámica de sprites
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Assets base a la caché');
      await cache.addAll(ASSETS);

      try {
        console.log('[Service Worker] Sprites dinámicos a la caché');
        const response = await fetch('./assets.json');
        const sprites = await response.json();
        console.log('[Service Worker] Sprites que irán a la caché:', sprites);
        await cache.addAll(sprites);
      } catch (error) {
        console.error('[Service Worker] No se pudieron cachear los sprites dinámicos:', error);
      }
    })
  );
  self.skipWaiting();
});

// Evento de activación: Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});


// Evento de fetch: Responder con caché o hacer fetch y cachear dinámicamente
self.addEventListener('fetch', (event) => {
  // Aplicar solamente a GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Aplicar solamente a HTTP/HTTPS
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Si el recurso está en caché, devolverlo
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Si no está en caché, hacer fetch y cachear dinámicamente
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
        console.error('[Service Worker] No se pudo hacer fetch:', err);
      });
    })
  );
});



