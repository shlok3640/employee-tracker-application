import { app, BrowserWindow, desktopCapturer, screen, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let mainWindow;
let monitoringTimeout = null; // Changed from monitoringInterval

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // For development, load a URL; for production, load an HTML file.
  // We'll point this to the React dev server for now.
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function stopMonitoring() {
  console.log('[IPC] Stopping monitoring...');
  if (monitoringTimeout) {
    clearTimeout(monitoringTimeout);
    monitoringTimeout = null;
  }
  store.delete('token');
  store.delete('user');
  console.log('[IPC] Monitoring stopped successfully.');
}

async function scheduleMonitoring() {
  try {
    await startMonitoring();
  } catch (error) {
    console.error('[Schedule] Error during monitoring cycle:', error);
  }

  // If monitoring hasn't been stopped, schedule the next run.
  if (monitoringTimeout !== null) {
    monitoringTimeout = setTimeout(scheduleMonitoring, 30000);
  }
}

ipcMain.on('start-monitoring', (event, { token, user }) => {
  console.log('[IPC] Received start-monitoring event for user:', user.email);
  store.set('token', token);
  store.set('user', user);

  // Stop any previous monitoring loop before starting a new one.
  if (monitoringTimeout) {
    clearTimeout(monitoringTimeout);
  }
  
  // Set the timeout for the first run.
  monitoringTimeout = setTimeout(scheduleMonitoring, 1000); // Start after 1 second
  
  console.log('[IPC] Monitoring scheduled to start.');
});

ipcMain.on('stop-monitoring', () => {
  console.log('[IPC] Received stop-monitoring event');
  stopMonitoring();
});

async function captureScreen() {
  console.log('[Capture] Getting primary display...');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  console.log(`[Capture] Primary display found: ${width}x${height}`);

  try {
    console.log('[Capture] Getting screen sources...');
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height },
    });
    console.log(`[Capture] Found ${sources.length} screen source(s).`);

    const primaryScreenSource = sources.find(source => source.name === 'Entire screen' || source.id.startsWith('screen:'));

    if (primaryScreenSource) {
      console.log(`[Capture] Found matching screen source: ${primaryScreenSource.name}`);
      const screenshot = primaryScreenSource.thumbnail.toDataURL();
      console.log('[Capture] Screenshot converted to data URL successfully.');
      return screenshot;
    }
    console.error('[Capture] No matching screen source found.');
    return null;
  } catch (error) {
    console.error('[Capture] Error during screen capture:', error);
    return null;
  }
}

async function startMonitoring() {
  console.log('[Monitoring] Attempting to capture and send screenshot...');
  const screenshot = await captureScreen();
  const token = store.get('token');
  const user = store.get('user');

  if (!screenshot) {
    console.error('[Monitoring] Failed to capture screenshot. The screen source might not have been found.');
    return;
  }
  
  console.log('[Monitoring] Screenshot captured successfully.');
  console.log('[Monitoring] Screenshot size (characters):', screenshot.length);
  console.log('[Monitoring] Screenshot starts with:', screenshot.substring(0, 50) + '...');

  if (token && user) {
    try {
      console.log(`[Monitoring] Sending screenshot for user: ${user.email}`);
      const response = await axios.post('http://localhost:3000/api/monitoring/screenshot', {
        image: screenshot,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[Monitoring] Screenshot sent successfully. Server responded:', response.data);
    } catch (error) {
      console.error('[Monitoring] Error sending screenshot to server:', error.response ? error.response.data : error.message);
      if (error.response) {
        console.error('[Monitoring] Response status:', error.response.status);
        console.error('[Monitoring] Response headers:', error.response.headers);
      }
    }
  } else {
    console.error('[Monitoring] Token or user not found in store. Cannot send screenshot.');
    console.error('[Monitoring] Token exists:', !!token);
    console.error('[Monitoring] User exists:', !!user);
  }
}

// The rest of the screenshot and monitoring logic will go here. 