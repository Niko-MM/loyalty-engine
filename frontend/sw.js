// Простой Service Worker для PWA
const CACHE_NAME = 'loyalty-app-v1';

self.addEventListener('install', function(event) {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Простая стратегия кэширования
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
