const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (options) => ipcRenderer.invoke('write-file', options),
  fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
  ensureDirectory: (dirPath) => ipcRenderer.invoke('ensure-directory', dirPath),
  isElectron: true,
});
