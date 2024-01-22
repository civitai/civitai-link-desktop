import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { BrowserWindow, Tray, app, ipcMain, nativeImage, shell } from 'electron';
import { join } from 'path';
import { io } from 'socket.io-client';
import logoConnected from '../../resources/favicon-connected@2x.png?asset';
import logoPending from '../../resources/favicon-pending@2x.png?asset';
import logoDisconnected from '../../resources/favicon-disconnected@2x.png?asset';
import logo from '../../resources/favicon@2x.png?asset';
import { ConnectionStatus, getUpgradeKey, setConnectionStatus, setKey, setUpgradeKey } from './store';

let tray;
const socket = io('http://localhost:3000', { path: '/api/socketio', autoConnect: false });

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function socketIOConnect() {
  socket.connect();
  console.log('Socket connecting...');
  setConnectionStatus(ConnectionStatus.CONNECTING);

  // Event handlers
  socket.on('connect', () => {
    console.log('Connected to Civitai Link Server');
    socket.emit('iam', { type: 'sd' });
    setConnectionStatus(ConnectionStatus.CONNECTING);

    // Set logo to pending (connected but not in a room) (Orange)
    const icon = nativeImage.createFromPath(logoPending);
    tray.setImage(icon);
    const key = getUpgradeKey();

    if (key) {
      console.log('Using upgrade key');
      socket.emit('join', key, () => {
        console.log(`Joined room ${key}`);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Civitai Link Server');
    setConnectionStatus(ConnectionStatus.DISCONNECTED);

    // TODO: Add reconnect logic

    // Set logo to disconnected
    const icon = nativeImage.createFromPath(logoDisconnected);
    tray.setImage(icon);
  });

  socket.on('error', (err) => {
    console.log(err);
  });

  socket.on('command', (payload) => {
    console.log('command', payload);

    /**
     * Useful links
     * https://www.electronjs.org/docs/latest/tutorial/progress-bar
     */
  });

  socket.on('kicked', () => {
    console.log('Kicked from instance. Clearing key.');
    // Reset key
  });

  socket.on('roomPresence', (payload) => {
    console.log(`Presence update: SD: ${payload['sd']}, Clients: ${payload['client']}`);
  });

  socket.on('upgradeKey', (payload) => {
    console.log(`Received upgrade key: ${payload['key']}`);
    setUpgradeKey(payload['key']);

    socket.emit('join', payload['key'], () => {
      console.log(`Re-joined room with upgrade key: ${payload['key']}`);
    });
  });

  socket.on('join', () => {
    // Set logo to connected when in room (green)
    const icon = nativeImage.createFromPath(logoConnected);
    tray.setImage(icon);
  });

  app.on('before-quit', () => {
    socket.close();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.on('set-key', (_, key) => {
    setKey(key);
    socket.emit('join', key, () => {
      console.log(`Joined room ${key}`);
    });
  });

  // Set logo to disconnected (red)
  const icon = nativeImage.createFromPath(logoDisconnected);
  tray = new Tray(icon);
  tray.setToolTip('Civitai Link');

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();
  socketIOConnect();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
