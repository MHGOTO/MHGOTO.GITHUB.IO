const CACHE_NAME = 'linkmaster-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// התקנה ושמירת קבצים במטמון
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
  );
});

// שליפת קבצים מהמטמון או מהרשת
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // אם נמצא במטמון - החזר אותו
        if (response) {
          return response;
        }
        // אחרת - משוך מהרשת
        return fetch(event.request).catch(() => {
            // טיפול במקרה של אופליין מוחלט
            return caches.match('./index.html');
        });
      })
  );
});

// ניקוי מטמון ישן בעת עדכון גרסה
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
