// service-worker.js
const CACHE_NAME = "portfolio-cache-v1";
const OFFLINE_URL = "offline.html";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/",
  "index.html",
  "styles.css",
  "assets/css/style.css",
  "assets/js/main.js",
  "assets/vendor/bootstrap/css/bootstrap.min.css",
  "assets/fonts/poppins-v23-latin-regular.woff2",
  "assets/fonts/poppins-v23-latin-600.woff2",
  "assets/img/profile-img.webp",
  "assets/img/hero-bg.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Navigation: Network-first, fallback to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Assets (CSS, JS, Fonts, Images): Stale-while-revalidate
  const isAsset = request.destination === 'style' || 
                  request.destination === 'script' || 
                  request.destination === 'font' || 
                  request.destination === 'image';

  if (isAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchedResponse = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });

          return cachedResponse || fetchedResponse;
        });
      })
    );
  }
});
