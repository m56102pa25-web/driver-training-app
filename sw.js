const CACHE_NAME = 'jfl-guide-v13';
const ASSETS = ['./','./index.html','./manifest.json','./icon-180.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k!==CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

/* ネットワーク優先：リロードで即最新版を取得、オフライン時はキャッシュで動作 */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const cp = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request))
  );
});
