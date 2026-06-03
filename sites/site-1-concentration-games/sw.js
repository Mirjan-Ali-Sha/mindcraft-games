/* Site 1: Concentration Games - Service Worker */
const CACHE_NAME = 'mindcraft-concentration-v8';
const ASSETS_TO_CACHE = [
  './index.html',
  './css/theme.css',
  './js/hub.js',
  './manifest.json',
  '../../shared/css/design-tokens.css',
  '../../shared/css/components.css',
  '../../shared/js/game-engine.js',
  '../../shared/js/pwa-shell.js',
  '../../shared/icons/icon-192.png',
  '../../shared/icons/icon-512.png',
  './games/spot-difference/index.html',
  './games/spot-difference/css/style.css',
  './games/spot-difference/js/script.js',
  './games/ball-tracker/index.html',
  './games/ball-tracker/css/style.css',
  './games/ball-tracker/js/script.js',
  './games/match-pairs/index.html',
  './games/match-pairs/css/style.css',
  './games/match-pairs/js/script.js',
  './games/word-finder/index.html',
  './games/word-finder/css/style.css',
  './games/word-finder/js/script.js',
  './games/face-memory/index.html',
  './games/face-memory/css/style.css',
  './games/face-memory/js/script.js',
  './games/bubble-math/index.html',
  './games/bubble-math/css/style.css',
  './games/bubble-math/js/script.js',
  './games/shape-follower/index.html',
  './games/shape-follower/css/style.css',
  './games/shape-follower/js/script.js',
  './games/counting-candy/index.html',
  './games/counting-candy/css/style.css',
  './games/counting-candy/js/script.js',
  './games/card-flip-memory/index.html',
  './games/card-flip-memory/css/style.css',
  './games/card-flip-memory/js/script.js',
  './games/color-word-stroop/index.html',
  './games/color-word-stroop/css/style.css',
  './games/color-word-stroop/js/script.js',
  './games/spatial-grid-memory/index.html',
  './games/spatial-grid-memory/css/style.css',
  './games/spatial-grid-memory/js/script.js',
  './games/mirror-match/index.html',
  './games/mirror-match/css/style.css',
  './games/mirror-match/js/script.js'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Site 1 App Shell and Core Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event (Clean up old caches)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Cache First, fallback to Network)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Prevent decoding failed errors (ERR_CONTENT_DECODING_FAILED) on decompressed cache assets
        if (cachedResponse.headers.has('content-encoding')) {
          const newHeaders = new Headers(cachedResponse.headers);
          newHeaders.delete('content-encoding');
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers: newHeaders
          });
        }
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache newly fetched game assets dynamically if they belong to this origin
        if (e.request.url.startsWith(self.location.origin) && 
            (e.request.url.includes('/games/') || e.request.url.includes('/shared/'))) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback if network fails
      console.warn('[SW] Resource fetch failed offline');
    })
  );
});
