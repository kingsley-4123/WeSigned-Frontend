importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

self.skipWaiting(); // Activate new SW immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Take control of all pages right away
});

if (workbox) {
  // Precache manifest will be injected by build tools (e.g., Vite, Webpack)
  workbox.precaching.precacheAndRoute([
    ...(self.__WB_MANIFEST || []),
    { url: '/images/offline.png', revision: null }
  ]);

  // Runtime caching for images and static assets
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image' || request.destination === 'style' || request.destination === 'script' || request.destination === 'document',
    new workbox.strategies.NetworkFirst({
      cacheName: 'weSigned-static-assets-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Fallback: serve cached index.html for navigation requests, offline.html if not available
  workbox.routing.setCatchHandler(async ({event}) => {
    if (event.request.destination === 'document') {
      // Try to serve cached index.html (app shell)
      const cache = await caches.open(workbox.core.cacheNames.precache);
      const cachedIndex = await cache.match('/index.html');
      if (cachedIndex) {
        return cachedIndex;
      }
      // Fallback to offline.html if index.html is not cached
      return cache.match('/offline.html');
    }
    return Response.error();
  });
}



// ...existing code for sync, IndexedDB, and other custom logic...

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
    const open = indexedDB.open('WeSignedDB', 3);
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
    const open = indexedDB.open('WeSignedDB', 3); 
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
    const open = indexedDB.open('WeSignedDB', 3);
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
    const open = indexedDB.open('WeSignedDB', 3);
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
    const open = indexedDB.open('WeSignedDB', 3);
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
      // Show notification to user
      self.registration.showNotification('Attendance Synced', {
        body: 'Your offline attendance has been successfully synced!',
        icon: '/images/logo.png',
      });
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
      // Show notification to user
      self.registration.showNotification('Session Synced', {
        body: 'Your offline session has been successfully synced!',
        icon: '/images/logo.png',
      });
    } else {
      console.warn('SW: Sync failed, server returned', resp.status, data);
    }
  } catch (err) {
    console.error('SW: Sync error', err);
    // If failed, the sync will be retried next time
  }
}