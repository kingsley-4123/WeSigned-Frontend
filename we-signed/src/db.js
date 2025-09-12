import { openDB } from "idb";

const DB_NAME = "WeSignedDB";
const DB_VERSION = 1; // bump this whenever you add a new store

// List all stores here
const STORES = ["studentAttendances", "user", "lecturerView"];

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
