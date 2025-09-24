const CACHE_NAME = "we-signed-cache";
const urlsToCache = [
  "/",
  "/index.html",
  "/images/logo.png",
  // get the urls from the dist folder after running npm run build .
  "/images/offline.png",
  "/images/monster.png"
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

  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncPendingSessions());
  }
});

async function getAllPending() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('WeSignedDB', 2);
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

async function getAllSessions() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('WeSignedDB', 2); 
    open.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
      }
    };
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    };
    open.onerror = () => reject(open.error);
  });
}

async function clearSessions() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('WeSignedDB', 2);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('sessions', 'readwrite');
      tx.objectStore('sessions').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    open.onerror = () => reject(open.error);
  });
}

async function clearPending() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('WeSignedDB', 2);
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

async function clearSignIns() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('WeSignedDB', 2);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('signins', 'readwrite');
      tx.objectStore('signins').clear();
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
    console.log("Pending", pending);

    // send to server
    const resp = await fetch('http://localhost:5000/api/sync/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: pending }),
    });

    const formData = await resp.json();
    console.log('SW: Sync response data', formData);

    if (resp.status === 200 && formData.success) {
      await clearPending();
      await clearSignIns();
      console.log('SW: Synced pending attendance successfully');
      console.log('SW: Cleared pending sign-ins successfully');
    } else {
      console.warn('SW: Sync failed, server returned', resp.status, formData);
    }
  } catch (err) {
    console.error('SW: Sync error', err);
    // If failed, the sync will be retried next time
  }
}

async function syncPendingSessions() {
  try {
    const sessions = await getAllSessions();
    if (!sessions || sessions.length === 0) return;
    console.log("Sessions", sessions);
    // send to server
    const resp = await fetch('http://localhost:5000/api/sync/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: sessions }),
    });

    const data = await resp.json();
    console.log('SW: Sync response data', data);

    if (resp.status === 200 && data.success) {
      await clearSessions();
      console.log('SW: Synced pending sessions successfully');
    } else {
      console.warn('SW: Sync failed, server returned', resp.status, data);
    }
  } catch (err) {
    console.error('SW: Sync error', err);
    // If failed, the sync will be retried next time
  }
}