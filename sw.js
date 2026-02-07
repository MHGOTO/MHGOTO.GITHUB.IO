const CACHE_NAME = 'link-manager-fix-v1';
const ASSETS = [
    './',
    './index.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys => Promise.all(
        keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)
    )));
});

self.addEventListener('fetch', (e) => {
    // לא שומרים במטמון בקשות של Firebase כדי למנוע תקלות התחברות
    if (e.request.url.includes('firebase') || e.request.url.includes('googleapis')) return;
    
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
