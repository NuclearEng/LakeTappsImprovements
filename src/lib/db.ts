import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import type { Project } from '@/types';

let db: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

const DB_NAME = 'lake_tapps_permits.db';

// Get the database storage path
async function getDbPath(): Promise<string> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
    const userDataPath = await (window as any).electronAPI.getUserDataPath();
    return `${userDataPath}/${DB_NAME}`;
  }
  return DB_NAME;
}

// Initialize the database
export async function initDb(): Promise<Database> {
  if (db) return db;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    // Try to load existing database
    let loadedDb: Database;

    if (typeof window !== 'undefined') {
      try {
        // Try IndexedDB first (browser storage)
        const savedData = await loadFromIndexedDB();
        if (savedData) {
          loadedDb = new SQL.Database(savedData);
        } else {
          loadedDb = new SQL.Database();
        }
      } catch {
        loadedDb = new SQL.Database();
      }
    } else {
      loadedDb = new SQL.Database();
    }

    // Create tables if they don't exist
    loadedDb.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    loadedDb.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    loadedDb.run(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data BLOB NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

    db = loadedDb;

    // Save to IndexedDB after initialization
    await saveToIndexedDB();

    return loadedDb;
  })();

  return dbInitPromise;
}

// IndexedDB helpers for browser persistence
const IDB_NAME = 'LakeTappsPermitsDB';
const IDB_STORE = 'database';

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(IDB_STORE)) {
        idb.createObjectStore(IDB_STORE);
      }
    };

    request.onsuccess = () => {
      const idb = request.result;
      const transaction = idb.transaction(IDB_STORE, 'readonly');
      const store = transaction.objectStore(IDB_STORE);
      const getRequest = store.get('db');

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
    };
  });
}

async function saveToIndexedDB(): Promise<void> {
  if (!db) return;

  const data = db.export();

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(IDB_STORE)) {
        idb.createObjectStore(IDB_STORE);
      }
    };

    request.onsuccess = () => {
      const idb = request.result;
      const transaction = idb.transaction(IDB_STORE, 'readwrite');
      const store = transaction.objectStore(IDB_STORE);
      const putRequest = store.put(data, 'db');

      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve();
    };
  });
}

// Auto-save functionality
let saveTimeout: NodeJS.Timeout | null = null;

function scheduleSave(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(async () => {
    await saveToIndexedDB();
  }, 1000); // Debounce saves by 1 second
}

// Project CRUD operations
export async function saveProjectToDb(project: Project): Promise<void> {
  const database = await initDb();

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO projects (id, data, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run([
    project.id,
    JSON.stringify(project),
    project.createdAt,
    project.updatedAt,
  ]);

  stmt.free();
  scheduleSave();
}

export async function loadProjectFromDb(id: string): Promise<Project | null> {
  const database = await initDb();

  const stmt = database.prepare('SELECT data FROM projects WHERE id = ?');
  stmt.bind([id]);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return JSON.parse(row.data as string) as Project;
  }

  stmt.free();
  return null;
}

export async function getAllProjects(): Promise<Project[]> {
  const database = await initDb();

  const results = database.exec('SELECT data FROM projects ORDER BY updated_at DESC');

  if (results.length === 0) {
    return [];
  }

  return results[0].values.map((row) => JSON.parse(row[0] as string) as Project);
}

export async function deleteProject(id: string): Promise<void> {
  const database = await initDb();

  database.run('DELETE FROM files WHERE project_id = ?', [id]);
  database.run('DELETE FROM projects WHERE id = ?', [id]);

  scheduleSave();
}

// Settings operations
export async function getSetting(key: string): Promise<string | null> {
  const database = await initDb();

  const stmt = database.prepare('SELECT value FROM settings WHERE key = ?');
  stmt.bind([key]);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row.value as string;
  }

  stmt.free();
  return null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await initDb();

  database.run(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );

  scheduleSave();
}

// File operations
export async function saveFile(
  projectId: string,
  fileId: string,
  name: string,
  type: string,
  size: number,
  data: Uint8Array
): Promise<void> {
  const database = await initDb();

  database.run(
    `INSERT OR REPLACE INTO files (id, project_id, name, type, size, data, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fileId, projectId, name, type, size, data, new Date().toISOString()]
  );

  scheduleSave();
}

export async function getFile(fileId: string): Promise<Uint8Array | null> {
  const database = await initDb();

  const stmt = database.prepare('SELECT data FROM files WHERE id = ?');
  stmt.bind([fileId]);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row.data as Uint8Array;
  }

  stmt.free();
  return null;
}

export async function deleteFile(fileId: string): Promise<void> {
  const database = await initDb();
  database.run('DELETE FROM files WHERE id = ?', [fileId]);
  scheduleSave();
}

// Export database for backup
export async function exportDatabase(): Promise<Uint8Array> {
  const database = await initDb();
  return database.export();
}

// Import database from backup
export async function importDatabase(data: Uint8Array): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  db = new SQL.Database(data);
  await saveToIndexedDB();
}
