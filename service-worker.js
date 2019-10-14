const CACHE_NAME = 'static-cache-v1.2';

const FILES_TO_CACHE = [
    'index.html',
    'favicon.ico',
    'css/bootstrap3.css',
    'css/main.css',
    'js/vendor/jquery-1.9.0.min.js',
    'js/vendor/modernizr-2.6.2-respond-1.1.0.min.js',
    'js/vendor/bootstrap3.min.js',
    'js/main.js',
    'js/vendor/jlinq.js',
    //'js/vendor/fastclick.js',
    'js/vendor/jquery.history.js',
    'js/queryStringToJson.js',
    'js/snippet.js',
    'js/vendor/jquery.touchSwipe.min.js',
    //'fonts/glyphicons-halflings-regular.eot',
    //'fonts/glyphicons-halflings-regular.svg',
    //'fonts/glyphicons-halflings-regular.ttf',
    //'fonts/glyphicons-halflings-regular.woff',
    'data/data.json',
    'http://fonts.googleapis.com/css?family=Open+Sans:400italic,700italic,400,700',
    'http://themes.googleusercontent.com/static/fonts/opensans/v6/cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw.woff',
    'http://themes.googleusercontent.com/static/fonts/opensans/v6/k3k702ZOKiLJc3WVjuplzHhCUOGz7vYGh680lGh-uXM.woff',
    'about.html',
    'img/mitchell.jpg',
    'img/florman.jpg',
    'img/header-icon.png',
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.
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
  // CODELAB: Remove previous cached data from disk.

  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  // CODELAB: Add fetch event handler here.
   console.log(evt.request.url);

    evt.respondWith(
        caches.match(evt.request).then(function(response) {
            return response || fetch(evt.request);
        })
    );
});
