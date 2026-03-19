const CACHE = 'dailyflow-v1';
const ASSETS = [
  '/daily-flow/',
  '/daily-flow/index.html',
  '/daily-flow/manifest.json',
  '/daily-flow/sw.js',
  '/daily-flow/icon-192.png',
  '/daily-flow/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'
];
 
// Install — cache all core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});
 
// Activate — clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', e => {
  // Don't intercept intent:// or lifeup:// links
  if (!e.request.url.startsWith('http')) return;
 
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache successful GET responses
        if (e.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return cached index
        if (e.request.mode === 'navigate') {
          return caches.match('/daily-flow/index.html');
        }
      });
    })
  );
});
