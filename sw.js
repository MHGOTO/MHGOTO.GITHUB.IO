const CACHE_NAME = 'link-manager-v3'; // שיניתי גרסה כדי לכפות עדכון מיידי במכשירים
const STATIC_ASSETS = [
    './',
    './index.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// התקנה
self.addEventListener('install', (event) => {
    self.skipWaiting(); // מפעיל את ה-SW החדש מיד
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// אקטיבציה - ניקוי ישן
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// אסטרטגיית רשת-קודם (Network First) עבור HTML, כדי שעדכונים יראו מיד
// עבור נכסים סטטיים כמו תמונות אפשר מטמון-קודם
self.addEventListener('fetch', (event) => {
    // התעלמות מבקשות של Firebase Auth/Firestore (הם מנהלים את עצמם)
    const url = new URL(event.request.url);
    if (url.hostname.includes('firebase') || 
        url.hostname.includes('googleapis') ||
        url.hostname.includes('gstatic')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // הצלחה ברשת? נעדכן את המטמון ונחזיר תשובה
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // אין רשת? ננסה מהמטמון
                return caches.match(event.request);
            })
    );
});
