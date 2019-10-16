const CACHE_NAME = 'static-cache-v1.9';

const FILES_TO_CACHE = [
    'index.html',
    'service-worker.js',
    'manifest.json',
    './favicon.ico',
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
    'https://fonts.googleapis.com/css?family=Open+Sans:400italic,700italic,400,700',
    'https://themes.googleusercontent.com/static/fonts/opensans/v6/cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw.woff',
    'https://themes.googleusercontent.com/static/fonts/opensans/v6/k3k702ZOKiLJc3WVjuplzHhCUOGz7vYGh680lGh-uXM.woff',
    'about.html',
    'img/mitchell.jpg',
    'img/florman.jpg',
    'img/header-icon.png',
    'res/icon/pwa/icon-128.png',
    'res/icon/pwa/icon-144.png',
    'res/icon/pwa/icon-152.png',
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

  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
   console.log(evt.request.url);

    if (evt.request.mode !== 'navigate') {
        // Not a page navigation, bail.
        return;
    }
    evt.respondWith(
        fetch(evt.request)
            .catch(() => {
            return caches.open(CACHE_NAME)
                .then((cache) => {
                    return cache.match('index.html');
                });
            })
    );
});
