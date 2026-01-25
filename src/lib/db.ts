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

    // Version history table for tracking project snapshots
    loadedDb.run(`
      CREATE TABLE IF NOT EXISTS project_versions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        version_number INTEGER NOT NULL,
        data TEXT NOT NULL,
        description TEXT,
        trigger_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);

    // Create index for faster version lookups
    loadedDb.run(`
      CREATE INDEX IF NOT EXISTS idx_versions_project
      ON project_versions(project_id, version_number DESC)
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

export async function duplicateProject(id: string): Promise<Project | null> {
  const database = await initDb();

  const stmt = database.prepare('SELECT data FROM projects WHERE id = ?');
  stmt.bind([id]);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();

    const originalProject = JSON.parse(row.data as string) as Project;

    // Create a new project with a new ID and updated timestamps
    const { v4: uuidv4 } = await import('uuid');
    const newProject: Project = {
      ...originalProject,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStage: 1, // Reset to beginning
    };

    // Save the duplicated project
    await saveProjectToDb(newProject);

    return newProject;
  }

  stmt.free();
  return null;
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

// Version history types
export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  data: Project;
  description: string | null;
  triggerType: 'auto' | 'manual' | 'stage_complete' | 'before_restore';
  createdAt: string;
}

// Version history operations
export async function saveProjectVersion(
  project: Project,
  triggerType: ProjectVersion['triggerType'],
  description?: string
): Promise<ProjectVersion> {
  const database = await initDb();
  const { v4: uuidv4 } = await import('uuid');

  // Get the next version number for this project
  const stmt = database.prepare(
    'SELECT COALESCE(MAX(version_number), 0) as max_version FROM project_versions WHERE project_id = ?'
  );
  stmt.bind([project.id]);
  let maxVersion = 0;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    maxVersion = (row.max_version as number) || 0;
  }
  stmt.free();
  const versionNumber = maxVersion + 1;

  const version: ProjectVersion = {
    id: uuidv4(),
    projectId: project.id,
    versionNumber,
    data: project,
    description: description || null,
    triggerType,
    createdAt: new Date().toISOString(),
  };

  database.run(
    `INSERT INTO project_versions (id, project_id, version_number, data, description, trigger_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      version.id,
      version.projectId,
      version.versionNumber,
      JSON.stringify(version.data),
      version.description,
      version.triggerType,
      version.createdAt,
    ]
  );

  // Clean up old versions (keep last 50)
  database.run(
    `DELETE FROM project_versions
     WHERE project_id = ?
     AND id NOT IN (
       SELECT id FROM project_versions
       WHERE project_id = ?
       ORDER BY version_number DESC
       LIMIT 50
     )`,
    [project.id, project.id]
  );

  scheduleSave();
  return version;
}

export async function getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
  const database = await initDb();

  const stmt = database.prepare(
    `SELECT id, project_id, version_number, data, description, trigger_type, created_at
     FROM project_versions
     WHERE project_id = ?
     ORDER BY version_number DESC
     LIMIT 50`
  );
  stmt.bind([projectId]);

  const versions: ProjectVersion[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    versions.push({
      id: row.id as string,
      projectId: row.project_id as string,
      versionNumber: row.version_number as number,
      data: JSON.parse(row.data as string) as Project,
      description: row.description as string | null,
      triggerType: row.trigger_type as ProjectVersion['triggerType'],
      createdAt: row.created_at as string,
    });
  }
  stmt.free();

  return versions;
}

export async function getProjectVersion(versionId: string): Promise<ProjectVersion | null> {
  const database = await initDb();

  const stmt = database.prepare(
    `SELECT id, project_id, version_number, data, description, trigger_type, created_at
     FROM project_versions
     WHERE id = ?`
  );
  stmt.bind([versionId]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.getAsObject();
  stmt.free();

  return {
    id: row.id as string,
    projectId: row.project_id as string,
    versionNumber: row.version_number as number,
    data: JSON.parse(row.data as string) as Project,
    description: row.description as string | null,
    triggerType: row.trigger_type as ProjectVersion['triggerType'],
    createdAt: row.created_at as string,
  };
}

export async function restoreProjectVersion(versionId: string): Promise<Project | null> {
  const version = await getProjectVersion(versionId);
  if (!version) return null;

  // Save current state as a backup version before restoring
  const currentProject = await loadProjectFromDb(version.projectId);
  if (currentProject) {
    await saveProjectVersion(
      currentProject,
      'before_restore',
      `Backup before restoring to version ${version.versionNumber}`
    );
  }

  // Restore the project data with updated timestamp
  const restoredProject: Project = {
    ...version.data,
    updatedAt: new Date().toISOString(),
  };

  await saveProjectToDb(restoredProject);
  return restoredProject;
}

export async function deleteProjectVersions(projectId: string): Promise<void> {
  const database = await initDb();
  database.run('DELETE FROM project_versions WHERE project_id = ?', [projectId]);
  scheduleSave();
}

// Error recovery - attempt to recover from corrupt project data
export async function validateProjectData(projectId: string): Promise<{
  isValid: boolean;
  errors: string[];
  recoveredProject?: Project;
}> {
  const database = await initDb();
  const errors: string[] = [];

  try {
    const stmt = database.prepare('SELECT data FROM projects WHERE id = ?');
    stmt.bind([projectId]);

    if (!stmt.step()) {
      stmt.free();
      return { isValid: false, errors: ['Project not found'] };
    }

    const row = stmt.getAsObject();
    stmt.free();

    const rawData = row.data as string;
    let project: Project;

    try {
      project = JSON.parse(rawData);
    } catch (parseError) {
      errors.push('Failed to parse project JSON data');

      // Try to recover from versions
      const versions = await getProjectVersions(projectId);
      if (versions.length > 0) {
        return {
          isValid: false,
          errors,
          recoveredProject: versions[0].data,
        };
      }
      return { isValid: false, errors };
    }

    // Validate required fields
    if (!project.id) errors.push('Missing project ID');
    if (!project.owner) errors.push('Missing owner data');
    if (!project.details) errors.push('Missing project details');
    if (!project.site) errors.push('Missing site information');
    if (!project.permits) errors.push('Missing permits data');

    if (errors.length > 0) {
      // Try to recover from versions
      const versions = await getProjectVersions(projectId);
      if (versions.length > 0) {
        // Find a valid version
        for (const version of versions) {
          if (version.data.id && version.data.owner && version.data.details) {
            return {
              isValid: false,
              errors,
              recoveredProject: version.data,
            };
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors };
  }
}

// Auto-save version when completing a stage
export async function saveStageCompletionVersion(
  project: Project,
  stageName: string
): Promise<void> {
  await saveProjectVersion(
    project,
    'stage_complete',
    `Completed stage: ${stageName}`
  );
}
