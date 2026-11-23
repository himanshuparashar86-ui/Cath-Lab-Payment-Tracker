
/* Cath Lab Payment Tracker Service Worker */

const CACHE_NAME = 'cath-lab-tracker-v4';

const APP_ROOT = new URL('./', self.location.href);

const OFFLINE_URL = new URL('./index.html', APP_ROOT).toString();

const PRECACHE_URLS = [
  new URL('./', APP_ROOT).toString(),
  OFFLINE_URL,
  new URL('./manifest.json', APP_ROOT).toString(),
  new URL('./icon-192.png', APP_ROOT).toString(),
  new URL('./icon-512.png', APP_ROOT).toString()
];

// INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const url of PRECACHE_URLS) {
        try {
          const response = await fetch(url, { cache: 'no-cache' });
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.log('Cache skipped:', url);
        }
      }

      await self.skipWaiting();
    })()
  );
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith('cath-lab-tracker-') &&
              key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Page navigation: network first
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(OFFLINE_URL, response.clone());
          }

          return response;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);

          return (
            (await cache.match(request)) ||
            (await cache.match(OFFLINE_URL)) ||
            Response.error()
          );
        }
      })()
    );

    return;
  }

  // Static files: cache first
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok) {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return Response.error();
      }
    })()
  );
});
