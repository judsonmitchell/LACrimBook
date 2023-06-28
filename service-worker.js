const CACHE_NAME = 'static-cache-v3.4.1';

const FILES_TO_CACHE = [
    'index.html',
    'service-worker.js',
    'manifest.json',
    'css/bootstrap3.css',
    'css/main.css',
    'js/vendor/jquery-1.9.0.min.js',
    'js/vendor/modernizr-2.6.2-respond-1.1.0.min.js',
    'js/vendor/bootstrap3.min.js',
    'js/main.js',
    'js/vendor/jlinq.js',
    'js/vendor/jquery.history.js',
    'js/queryStringToJson.js',
    'js/snippet.js',
    'js/vendor/jquery.touchSwipe.min.js',
    'data/data.json',
    'about.html',
    'img/mitchell.jpg',
    'img/florman.jpg',
    'img/header-icon.png',
    'res/icon/pwa/icon-128.png',
    'res/icon/pwa/icon-144.png',
    'res/icon/pwa/icon-152.png',
    'res/icon/pwa/icon-180.png',
    'res/icon/pwa/icon-192.png',
    'res/icon/pwa/icon-256.png',
    'res/icon/pwa/icon-512.png'
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline page');
        return cache.addAll(FILES_TO_CACHE);
        })
    );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
    evt.waitUntil(
        caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
            }
        }));
        })
    );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);

  evt.respondWith(
    caches.match(evt.request)
      .then(function(response) {
        if (response) {
          // If the file is in the cache, serve it
          console.log('[ServiceWorker] Found ', evt.request.url, ' in cache');
          return response;
        }

        // Otherwise, fetch the file from the network
        console.log('[ServiceWorker] Network request for ', evt.request.url);
        return fetch(evt.request)

        // If the user is offline and the request was for a navigation request (page load)
        // Then serve an offline page
        .catch(function() {
          if (evt.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
      })
  );
});

