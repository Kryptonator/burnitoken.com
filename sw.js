const CACHE_NAME = 'burni-cache-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/assets/css/styles.min.css',
  '/assets/scripts.min.js',
  '/assets/scripts.js',
  '/assets/config.js',
  '/assets/browserconfig.xml',
  '/assets/images/burniimage.jpg',
  '/assets/images/favicon.ico',
  '/assets/images/favicon-32x32.png',
  '/assets/images/favicon-16x16.png',
  '/assets/images/apple-touch-icon.png',
  '/assets/images/mstile-150x150.png',
  '/assets/images/burni-social.jpg',
  '/assets/images/burni-logo.png',
  '/assets/images/burn-chart1.jpg',
  '/assets/images/burn-coin-schwarzes-loch.jpg',
  '/assets/images/burni-chart.jpg',
  '/assets/images/burni-lagerfeuer.jpg',
  '/assets/images/burni-verbrannt.jpg',
  '/assets/images/burni-verbrennt-burnis-im-lagerfeuer.jpeg',
  '/assets/images/burni-versperrt-coins-im-tresor.jpg',
  '/assets/images/burni.png',
  '/assets/images/burnicoin.jpg',
  '/assets/images/burnicoin1.jpg',
  '/assets/images/burni1.png',
  '/assets/images/burni1 (1).png',
  '/assets/images/burni-verbrennt-lagerfeuer.jpg',
  '/assets/images/burni-chart-illustration.jpg',
  '/assets/images/gamepad.png',
  '/assets/images/gamepad.svg',
  '/assets/images/palette.png',
  '/assets/images/use-case-rewards.jpg',
  '/assets/images/exchange.png',
  '/assets/images/vote.png',
  '/assets/images/burni-07.27.2027.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }),
  );
});
