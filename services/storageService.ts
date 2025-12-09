import { DailyLog, Driver, Transaction, DayStatus } from '../types';

const DB_NAME = 'AlqabasiDB';
const DB_VERSION = 1;
const SESSION_KEY = 'alqabasi_current_driver_mobile';

// --- IDB Helpers ---

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IDB Error", request.error);
      reject(request.error);
    };

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Drivers store
      if (!db.objectStoreNames.contains('drivers')) {
        db.createObjectStore('drivers', { keyPath: 'mobile' });
      }

      // Logs store
      if (!db.objectStoreNames.contains('logs')) {
        const logsStore = db.createObjectStore('logs', { keyPath: 'id' });
        // Indexes for querying
        logsStore.createIndex('driverId', 'driverId', { unique: false });
        logsStore.createIndex('date', 'date', { unique: false });
      }
    };
  });

  return dbPromise;
};

// Generic IDB operations
const put = async (storeName: string, value: any): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const get = async (storeName: string, key: string): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllFromIndex = async (storeName: string, indexName: string, value: string): Promise<any[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Initialization & Migration ---

export const initStorage = async (): Promise<void> => {
  try {
    const db = await openDB();
    
    // Check for legacy localStorage data and migrate if found
    const lsDriver = localStorage.getItem('alqabasi_driver');
    
    if (lsDriver) {
      console.log("Migrating legacy data to IndexedDB...");
      const driver = JSON.parse(lsDriver);
      
      // Save driver to IDB
      await put('drivers', driver);
      localStorage.setItem(SESSION_KEY, driver.mobile); // Set session
      
      // Migrate logs
      const lsLogs = localStorage.getItem(`alqabasi_data_${driver.mobile}`);
      if (lsLogs) {
        const logs: DailyLog[] = JSON.parse(lsLogs);
        // We use a single transaction for all logs to be safe/fast
        const tx = db.transaction('logs', 'readwrite');
        const store = tx.objectStore('logs');
        logs.forEach(log => store.put(log));
        
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        
        // Cleanup old logs
        localStorage.removeItem(`alqabasi_data_${driver.mobile}`);
      }
      
      // Cleanup old driver
      localStorage.removeItem('alqabasi_driver');
      console.log("Migration complete.");
    }
  } catch (e) {
    console.error("Initialization/Migration failed", e);
  }
};

// --- API ---

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getDriver = async (): Promise<Driver | null> => {
  const mobile = localStorage.getItem(SESSION_KEY);
  if (!mobile) return null;
  return await get('drivers', mobile);
};

export const saveDriver = async (driver: Driver) => {
  await put('drivers', driver);
  localStorage.setItem(SESSION_KEY, driver.mobile);
};

export const logoutDriver = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getDailyLogs = async (driverId: string): Promise<DailyLog[]> => {
  const logs = await getAllFromIndex('logs', 'driverId', driverId);
  return logs.sort((a: DailyLog, b: DailyLog) => b.date - a.date);
};

export const saveDailyLog = async (driverId: string, log: DailyLog) => {
  // Ensure we save with driverId property for indexing
  const logToSave = { ...log, driverId };
  await put('logs', logToSave);
};

export const createNewDay = async (driverId: string): Promise<DailyLog> => {
  const today = new Date();
  const id = today.toISOString().split('T')[0];
  
  // Check if already exists in IDB
  const existingLog = await get('logs', id);
  
  if (existingLog && existingLog.driverId === driverId) {
    return existingLog;
  }

  const newLog: DailyLog = {
    id,
    driverId,
    date: Date.now(),
    status: DayStatus.OPEN,
    transactions: []
  };
  
  await saveDailyLog(driverId, newLog);
  return newLog;
};

export const exportData = async (driverId: string): Promise<string> => {
  const driver = await getDriver();
  const logs = await getDailyLogs(driverId);
  const data = {
    driver,
    logs,
    timestamp: Date.now()
  };
  return JSON.stringify(data);
};

export const importData = async (jsonString: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonString);
    if (data.driver && Array.isArray(data.logs)) {
      await saveDriver(data.driver);
      
      const db = await openDB();
      const tx = db.transaction('logs', 'readwrite');
      const store = tx.objectStore('logs');
      
      // Import logs
      data.logs.forEach((log: DailyLog) => store.put(log));
      
      return new Promise<boolean>((resolve) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }
    return false;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};