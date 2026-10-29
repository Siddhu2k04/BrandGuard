const DB_NAME = 'brandguard-db';
const DB_VERSION = 1;
const STORE = 'records';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecord(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => { db.close(); resolve(record); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getRecord(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
    request.onsuccess = () => { db.close(); resolve(request.result || null); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

export async function getLatestRecord(kind) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => {
      const records = request.result.filter(item => item.kind === kind).sort((a, b) => b.createdAt - a.createdAt);
      db.close(); resolve(records[0] || null);
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

export async function getAllRecords(kind) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => {
      const records = request.result.filter(item => !kind || item.kind === kind).sort((a, b) => b.createdAt - a.createdAt);
      db.close(); resolve(records);
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

export function makeId() {
  return globalThis.crypto?.randomUUID?.() || `bg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
