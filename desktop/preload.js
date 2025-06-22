const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // We'll add methods here to communicate from renderer to main process
  // For example, to start/stop monitoring or send login credentials
  startMonitoring: (token, user) => ipcRenderer.send('start-monitoring', { token, user }),
  stopMonitoring: () => ipcRenderer.send('stop-monitoring'),
}); 