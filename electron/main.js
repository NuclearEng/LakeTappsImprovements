const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV !== 'production';

// Security: Get the allowed data directory
const getUserDataPath = () => app.getPath('userData');
const getDocumentsPath = () => app.getPath('documents');

// Security: Validate that a path is within allowed directories
function isPathAllowed(filePath) {
  const normalizedPath = path.normalize(filePath);
  const allowedPaths = [
    getUserDataPath(),
    getDocumentsPath(),
    app.getPath('downloads'),
    app.getPath('desktop'),
  ];
  return allowedPaths.some(allowed => normalizedPath.startsWith(allowed));
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true, // Additional security layer
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // Security: Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://') && !url.startsWith('http://localhost')) {
      event.preventDefault();
    }
  });

  // Security: Prevent new windows from opening
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in system browser
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for file operations (with security validation)
ipcMain.handle('save-file', async (event, { content, defaultPath, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || path.join(getDocumentsPath(), 'Lake Tapps Permits'),
    filters: filters || [
      { name: 'PDF Documents', extensions: ['pdf'] },
      { name: 'Word Documents', extensions: ['docx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, Buffer.from(content));
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false };
});

ipcMain.handle('get-user-data-path', () => {
  return getUserDataPath();
});

ipcMain.handle('get-documents-path', () => {
  return getDocumentsPath();
});

// Security: Only allow reading from user data directory
ipcMain.handle('read-file', async (event, filePath) => {
  const normalizedPath = path.normalize(filePath);

  // Only allow reading from app data directory
  if (!normalizedPath.startsWith(getUserDataPath())) {
    return { success: false, error: 'Access denied: Path not allowed' };
  }

  try {
    const data = fs.readFileSync(normalizedPath);
    return { success: true, data: data.toString('base64') };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Security: Only allow writing to user data directory
ipcMain.handle('write-file', async (event, { filePath, content }) => {
  const normalizedPath = path.normalize(filePath);

  // Only allow writing to app data directory
  if (!normalizedPath.startsWith(getUserDataPath())) {
    return { success: false, error: 'Access denied: Path not allowed' };
  }

  try {
    fs.writeFileSync(normalizedPath, Buffer.from(content, 'base64'));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-exists', async (event, filePath) => {
  const normalizedPath = path.normalize(filePath);

  // Only allow checking app data directory
  if (!normalizedPath.startsWith(getUserDataPath())) {
    return false;
  }

  return fs.existsSync(normalizedPath);
});

ipcMain.handle('ensure-directory', async (event, dirPath) => {
  const normalizedPath = path.normalize(dirPath);

  // Only allow creating directories in app data
  if (!normalizedPath.startsWith(getUserDataPath())) {
    return { success: false, error: 'Access denied: Path not allowed' };
  }

  try {
    fs.mkdirSync(normalizedPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
