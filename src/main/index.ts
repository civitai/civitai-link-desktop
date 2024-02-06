import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { BrowserWindow, Tray, app, ipcMain, nativeImage, shell, screen, dialog } from 'electron';
import { join } from 'path';
import { io } from 'socket.io-client';
import logoConnected from '../../resources/favicon-connected@2x.png?asset';
import logoPending from '../../resources/favicon-pending@2x.png?asset';
import logoDisconnected from '../../resources/favicon-disconnected@2x.png?asset';
import logo from '../../resources/favicon@2x.png?asset';
import {
  ConnectionStatus,
  getUIStore,
  getUpgradeKey,
  setConnectionStatus,
  setDirectory,
  setKey,
  setUpgradeKey,
  clearSettings,
  store,
  getDirectories,
} from './store';
import {
  activitiesCancel,
  activitiesClear,
  activitiesList,
  imageTxt2img,
  resourcesAdd,
  resourcesList,
  resourcesRemove,
} from './commands';
import chokidar from 'chokidar';
import { hash } from './hash';

let tray;
let mainWindow;

//defaults
let width = 400;
let height = 300;

let margin_x = 0;
let margin_y = 0;
let framed = false;
const DEBUG = Boolean(import.meta.env.MAIN_VITE_DEBUG) || false;
const browserWindowOptions = DEBUG
  ? {
      show: false,
    }
  : {
      show: true,
      frame: framed,
      fullscreenable: false,
      resizable: false,
      useContentSize: true,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
    };

const socket = io(import.meta.env.MAIN_VITE_SOCKET_URL, { path: '/api/socketio', autoConnect: false });

function createWindow() {
  const upgradeKey = getUpgradeKey();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    // height: height,
    maxWidth: width,
    // maxHeight: height,
    useContentSize: true,
    ...browserWindowOptions,
    ...(process.platform === 'linux' ? { logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  // Prevents dock icon from appearing on macOS
  mainWindow.setMenu(null);

  mainWindow.on('ready-to-show', () => {
    if (DEBUG) {
      mainWindow.webContents.openDevTools();
    }

    // Pass upgradeKey to window
    if (upgradeKey) mainWindow.webContents.send('upgrade-key', { key: upgradeKey });

    mainWindow.webContents.send('store-ready', getUIStore());
    mainWindow.webContents.send('app-ready', true);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    mainWindow.showInactive();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function setWindowAutoHide() {
  mainWindow.hide();
  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
      ipcMain.emit('tray-window-hidden', { window: mainWindow, tray: tray });
    }
  });
  if (framed) {
    mainWindow.on('close', function (event) {
      event.preventDefault();
      mainWindow.hide();
    });
  }
}

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
    ipcMain.emit('tray-window-hidden', { window: mainWindow, tray: tray });
    return;
  }

  showWindow();
  ipcMain.emit('tray-window-visible', { window: mainWindow, tray: tray });
}

function alignWindow() {
  const position = calculateWindowPosition();
  mainWindow.setBounds({
    width: width,
    height: height,
    x: position.x,
    y: position.y,
  });
}

function showWindow() {
  alignWindow();
  mainWindow.show();
}

function calculateWindowPosition() {
  const screenBounds = screen.getPrimaryDisplay().size;
  const trayBounds = tray.getBounds();

  //where is the icon on the screen?
  let trayPos = 4; // 1:top-left 2:top-right 3:bottom-left 4.bottom-right
  trayPos = trayBounds.y > screenBounds.height / 2 ? trayPos : trayPos / 2;
  trayPos = trayBounds.x > screenBounds.width / 2 ? trayPos : trayPos - 1;

  let DEFAULT_MARGIN = { x: margin_x, y: margin_y };
  let x;
  let y;

  //calculate the new window position
  switch (trayPos) {
    case 1: // for TOP - LEFT
      x = Math.floor(trayBounds.x + DEFAULT_MARGIN.x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y + DEFAULT_MARGIN.y + trayBounds.height / 2);
      break;

    case 2: // for TOP - RIGHT
      x = Math.floor(trayBounds.x - width - DEFAULT_MARGIN.x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y + DEFAULT_MARGIN.y + trayBounds.height / 2);
      break;

    case 3: // for BOTTOM - LEFT
      x = Math.floor(trayBounds.x + DEFAULT_MARGIN.x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y - height - DEFAULT_MARGIN.y + trayBounds.height / 2);
      break;

    case 4: // for BOTTOM - RIGHT
      x = Math.floor(trayBounds.x - width - DEFAULT_MARGIN.x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y - height - DEFAULT_MARGIN.y + trayBounds.height / 2);
      break;
  }

  return { x: x, y: y };
}

function socketCommandStatus(payload) {
  socket.emit('commandStatus', payload);
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

    const upgradeKey = getUpgradeKey();

    // Join room if upgrade upgradeKey exists
    if (upgradeKey) {
      console.log('Using upgrade key');
      socket.emit('join', upgradeKey, () => {
        // Set logo to connected when in room (green)
        const icon = nativeImage.createFromPath(logoConnected);
        tray.setImage(icon);

        console.log(`Joined room ${upgradeKey}`);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Civitai Link Server');
    setConnectionStatus(ConnectionStatus.DISCONNECTED);

    // Set logo to disconnected (red)
    const icon = nativeImage.createFromPath(logoDisconnected);
    tray.setImage(icon);
  });

  socket.on('error', (err) => {
    console.error(err);
  });

  socket.on('command', (payload) => {
    console.log('command', payload);

    switch (payload['type']) {
      case 'activities:list':
        activitiesList();
        break;
      case 'activities:clear':
        activitiesClear();
        break;
      case 'activities:cancel':
        activitiesCancel();
        break;
      case 'resources:list':
        resourcesList();
        break;
      case 'resources:add':
        const newPayload = {
          id: payload['id'],
          name: payload['resource']['name'],
          url: payload['resource']['url'],
          type: payload['resource']['type'],
          hash: payload['resource']['hash'],
          modelName: payload['resource']['modelName'],
          modelVersionName: payload['resource']['modelVersionName'],
        };
        resourcesAdd({
          payload: newPayload,
          socket,
          mainWindow,
        });
        socketCommandStatus(newPayload);
        break;
      case 'resources:remove':
        resourcesRemove();
        break;
      case 'image:txt2img':
        imageTxt2img();
        break;
      default:
        console.log(`Unknown command: ${payload['command']}`);
    }

    // socketCommandStatus(payload);
  });

  socket.on('kicked', () => {
    console.log('Kicked from instance. Clearing key.');
    setKey(null);
    setUpgradeKey(null);
  });

  socket.on('roomPresence', (payload) => {
    console.log(`Presence update: SD: ${payload['sd']}, Clients: ${payload['client']}`);
    // Python code
    // log(f"Presence update: SD: {payload['sd']}, Clients: {payload['client']}")
    // connected = payload['sd'] > 0 and payload['client'] > 0
    // if civitai.connected != connected:
    //     civitai.connected = connected
    //     if connected: log("Connected to Civitai Instance")
    //     else: log("Disconnected from Civitai Instance")
  });

  socket.on('upgradeKey', (payload) => {
    console.log(`Received upgrade key: ${payload['key']}`);
    setUpgradeKey(payload['key']);
    mainWindow.webContents.send('upgrade-key', { key: payload['key'] });

    socket.emit('join', payload['key'], () => {
      // Set logo to connected when in room (green)
      const icon = nativeImage.createFromPath(logoConnected);
      tray.setImage(icon);

      console.log(`Re-joined room with upgrade key: ${payload['key']}`);
    });
  });

  socket.on('join', () => {
    console.log('Joined room');
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
app.whenReady().then(async () => {
  // Set logo to disconnected (red)
  const icon = nativeImage.createFromPath(logoDisconnected);
  tray = new Tray(icon);
  tray.setToolTip('Civitai Link');

  createWindow();
  socketIOConnect();

  ipcMain.on('set-key', (_, key) => {
    setKey(key);
    socket.emit('join', key, () => {
      console.log(`Joined room ${key}`);
    });
  });

  ipcMain.on('set-directory', (_, directory) => {
    setDirectory(directory['type'], directory['path']);
  });

  ipcMain.on('clear-settings', () => {
    clearSettings();
  });

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (canceled) {
      return;
    } else {
      return filePaths[0];
    }
  });

  let watcher;
  const modelDirectory = getDirectories().model;

  // TODO: May need to watch multiple directories
  if (modelDirectory) {
    // @ts-ignore
    watcher = chokidar.watch(modelDirectory, { ignored: /(^|[\/\\])\../ }).on('add, unlink', (event, path) => {
      console.log(event, path);
    });
  }

  // This is in case the directory changes
  // We want to stop watching the current directory and start watching the new one
  store.onDidChange('modelDirectories', async (newValue) => {
    await watcher.close();

    // @ts-ignore
    watcher = chokidar.watch(newValue.model, { ignored: /(^|[\/\\])\../ }).on('add, unlink', (event, path) => {
      console.log(event, path);
    });
  });

  tray.on('click', function () {
    ipcMain.emit('tray-window-clicked', { window: mainWindow, tray: tray });
    toggleWindow();
  });

  if (!DEBUG) {
    setWindowAutoHide();
    alignWindow();
  }

  ipcMain.emit('tray-window-ready', { window: mainWindow, tray: tray });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Hides dock icon on macOS but keeps in taskbar
  app.dock.hide();

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

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
