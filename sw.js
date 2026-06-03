/* MindCraft Games Portal - Root Service Worker */
const CACHE_NAME = 'mindcraft-portal-v7';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './css/main-hub.css',
  './shared/css/design-tokens.css',
  './shared/css/components.css',
  './shared/js/game-engine.js',
  './shared/js/pwa-shell.js',
  './shared/icons/icon-192.png',
  './shared/icons/icon-512.png',
  './sites/site-1-concentration-games/index.html',
  './sites/site-1-concentration-games/manifest.json',
  './sites/site-1-concentration-games/css/theme.css',
  './sites/site-1-concentration-games/js/hub.js',
  
  // Game 1: Spot the Difference
  './sites/site-1-concentration-games/games/spot-difference/index.html',
  './sites/site-1-concentration-games/games/spot-difference/css/style.css',
  './sites/site-1-concentration-games/games/spot-difference/js/script.js',
  
  // Game 2: Ball Tracker
  './sites/site-1-concentration-games/games/ball-tracker/index.html',
  './sites/site-1-concentration-games/games/ball-tracker/css/style.css',
  './sites/site-1-concentration-games/games/ball-tracker/js/script.js',
  
  // Game 3: Match Pairs
  './sites/site-1-concentration-games/games/match-pairs/index.html',
  './sites/site-1-concentration-games/games/match-pairs/css/style.css',
  './sites/site-1-concentration-games/games/match-pairs/js/script.js',
  
  // Game 4: Word Finder
  './sites/site-1-concentration-games/games/word-finder/index.html',
  './sites/site-1-concentration-games/games/word-finder/css/style.css',
  './sites/site-1-concentration-games/games/word-finder/js/script.js',
  
  // Game 5: Face Memory
  './sites/site-1-concentration-games/games/face-memory/index.html',
  './sites/site-1-concentration-games/games/face-memory/css/style.css',
  './sites/site-1-concentration-games/games/face-memory/js/script.js',
  
  // Game 6: Bubble Math
  './sites/site-1-concentration-games/games/bubble-math/index.html',
  './sites/site-1-concentration-games/games/bubble-math/css/style.css',
  './sites/site-1-concentration-games/games/bubble-math/js/script.js',
  
  // Game 7: Shape Follower
  './sites/site-1-concentration-games/games/shape-follower/index.html',
  './sites/site-1-concentration-games/games/shape-follower/css/style.css',
  './sites/site-1-concentration-games/games/shape-follower/js/script.js',
  
  // Game 8: Counting Candy
  './sites/site-1-concentration-games/games/counting-candy/index.html',
  './sites/site-1-concentration-games/games/counting-candy/css/style.css',
  './sites/site-1-concentration-games/games/counting-candy/js/script.js',
  
  // Game 9: Card Flip Memory
  './sites/site-1-concentration-games/games/card-flip-memory/index.html',
  './sites/site-1-concentration-games/games/card-flip-memory/css/style.css',
  './sites/site-1-concentration-games/games/card-flip-memory/js/script.js',
  
  // Game 10: Color Word Stroop
  './sites/site-1-concentration-games/games/color-word-stroop/index.html',
  './sites/site-1-concentration-games/games/color-word-stroop/css/style.css',
  './sites/site-1-concentration-games/games/color-word-stroop/js/script.js',
  
  // Game 11: Spatial Grid Memory
  './sites/site-1-concentration-games/games/spatial-grid-memory/index.html',
  './sites/site-1-concentration-games/games/spatial-grid-memory/css/style.css',
  './sites/site-1-concentration-games/games/spatial-grid-memory/js/script.js',
  
  // Game 12: Mirror Match
  './sites/site-1-concentration-games/games/mirror-match/index.html',
  './sites/site-1-concentration-games/games/mirror-match/css/style.css',
  './sites/site-1-concentration-games/games/mirror-match/js/script.js'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Root SW] Caching Portal Hub App Shell and all 12 games');
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
            console.log('[Root SW] Clearing old cache', key);
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
        // Prevent decoding failed errors (ERR_CONTENT_DECODING_FAILED) on cache assets
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
        // Cache newly fetched files dynamically if they are from the same origin
        if (e.request.url.startsWith(self.location.origin) && 
            (e.request.url.includes('/games/') || e.request.url.includes('/shared/') || e.request.url.includes('/sites/'))) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
