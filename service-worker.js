const CACHE_NAME = "we-signed-cache";
const urlsToCache = [
    "/",
    "/index.html",
    "/src/main.jsx",
    "/src/App.jsx",
    "/src/index.css",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log("Opened cache");
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (evt) => {
    const req = evt.request;
    evt.respondWith(
        fetch(req)
        .then((res) => {
            // Optionally update cache for navigation requests/resources
            // clone response if you want to cache
            const clonedResponse = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, clonedResponse);
            });

            return res;
        })
        .catch(async () => {
            const cache = await caches.open(CACHE_NAME);
            const cached = await cache.match(req);
            return cached || cache.match('/offline.html');
        })
    );
});


self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});


self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncPendingAttendance());
  }
});

async function getAllPending() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('attendance-db', 1);
    open.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    };
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('pending', 'readonly');
      const store = tx.objectStore('pending');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    };
    open.onerror = () => reject(open.error);
  });
}


async function clearPending() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('attendance-db', 1);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('pending', 'readwrite');
      tx.objectStore('pending').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    open.onerror = () => reject(open.error);
  });
}

async function syncPendingAttendance() {
  try {
    const pending = await getAllPending();
    if (!pending || pending.length === 0) return;

    // send to server
    const resp = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: pending }),
    });

    if (resp.ok) {
      await clearPending();
      console.log('SW: Synced pending attendance successfully');
    } else {
      console.warn('SW: Sync failed, server returned', resp.status);
    }
  } catch (err) {
    console.error('SW: Sync error', err);
    // If failed, the sync will be retried next time
  }
}