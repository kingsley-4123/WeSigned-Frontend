import { openDB } from "idb";

const DB_NAME = "WeSignedDB";
const DB_VERSION = 3; // bump this whenever you add a new store

// List all stores here
const STORES = ["studentAttendances", "user", "lecturerView", "pending", "signins", "sessions", "pendingUser"];

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create any missing stores
      for (const storeName of STORES) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
        }
      }
    },
  });
}

// Add or update a record in a store.
export async function putData(storeName, data) {
  const db = await getDB();
  return db.put(storeName, data);
}


// Get all records from a store.
export async function getAllData(storeName) {
  const db = await getDB();
  return db.getAll(storeName);
}

// Get a record by id.
export async function getDataById(storeName, id) {
  const db = await getDB();
  return db.get(storeName, id);
}

// Delete a record by ID from a store.
export async function deleteData(storeName, id) {
  const db = await getDB();
  return db.delete(storeName, id);
}

export async function saveSession(storeName, session) {
  const db = await getDB();
  return db.add(storeName, session);
}

export async function saveSignIn(signin) {
  const db = await getDB();
  await db.add('signins', signin);
  // Also record to pending list for sync
  await db.add('pending', { type: 'signin', payload: signin });
}

export async function clearPending() {
  const db = await getDB();
  await db.clear('pending');
}

export async function handlePendingUser() {
  const db = await getDB();
  const pendingStores = await db.getAll('pendingUser');

  for (const p of pendingStores) {
    const timeDiff = Date.now() - p.createdAt;
    if (timeDiff >= 12 * 60 * 60 * 1000) {
      const existingUsers = await getAllData('user');
      if (existingUsers.length > 0) {
        for (const user of existingUsers) {
          await deleteData('user', user.id);
        }
      }
      await db.put('user', p);
      await db.delete('pendingUser', p.id);

      //Send local notification.
      if ("serviceWorker" in navigator && "Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification("Account Activated", {
            body: `Your account (${p.email}) has been activated. You can now log in.`,
            icon: "/images/logo.png",
            vibrate: [200, 100, 200],
          });
        }
      }
    }
  }
}

export async function isStoreEmpty(storeName) {
  const db = await getDB();
  const count = await db.count(storeName);
  return count === 0;
}

