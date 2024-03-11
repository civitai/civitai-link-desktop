// import { updateElectronApp } from 'update-electron-app';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import {
  BrowserWindow,
  app,
  ipcMain,
  shell,
  dialog,
  Tray,
  nativeImage,
  Menu,
  screen,
  nativeTheme,
} from 'electron';
import { join } from 'path';
import {
  getUIStore,
  getUpgradeKey,
  store,
  ConnectionStatus,
  getResourcePath,
} from './store';
import { socketIOConnect } from './socket';
import { checkModelsFolder } from './check-models-folder';
import { eventsListeners } from './events';
// import { folderWatcher } from './folder-watcher';

// Colored Logo Assets
import logo from '../../resources/favicon@2x.png?asset';
import logoConnected from '../../resources/favicon-connected@2x.png?asset';
import logoPending from '../../resources/favicon-pending@2x.png?asset';
import logoDisconnected from '../../resources/favicon-disconnected@2x.png?asset';

// updateElectronApp();

let mainWindow;
let tray;

//defaults
let width = 400;
let height = 600;
let margin_x = 0;
let margin_y = 0;

const DEBUG = import.meta.env.MAIN_VITE_DEBUG === 'true' || false;
const browserWindowOptions = DEBUG
  ? {
      frame: true,
      titleBarOverlay: true,
    }
  : {
      frame: false, // Dont frame the tray window
      fullscreenable: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      thickFrame: false,
    };

function createWindow() {
  const upgradeKey = getUpgradeKey();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    maxWidth: width,
    show: false,
    useContentSize: true,
    resizable: false,
    ...browserWindowOptions,
    ...(process.platform === 'linux' ? { logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false,
    },
    icon: logo,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1b1e' : '#fff',
  });

  // Prevents dock icon from appearing on macOS
  mainWindow.setMenu(null);

  mainWindow.on('ready-to-show', () => {
    if (DEBUG) {
      mainWindow.webContents.openDevTools();
    }

    // Pass upgradeKey to window
    if (upgradeKey) {
      mainWindow.webContents.send('upgrade-key', { key: upgradeKey });
    }

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
    if (!DEBUG) {
      mainWindow.hide();
    }
  });
}

function toggleWindow() {
  mainWindow.isDestroyed() ? createWindow() : showWindow();
}

function alignWindow() {
  const position = calculateWindowPosition();
  mainWindow.setPosition(position.x, position.y, false);
}

function showWindow() {
  alignWindow();

  if (DEBUG) {
    mainWindow.isFocused() ? mainWindow.hide() : mainWindow.show();
  } else {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  }
}

function calculateWindowPosition() {
  const screenBounds = screen.getPrimaryDisplay().size;
  const trayBounds = tray.getBounds();

  //where is the icon on the screen?
  let trayPos = 4; // 1:top-left 2:top-right 3:bottom-left 4.bottom-right
  trayPos = trayBounds.y > screenBounds.height / 2 ? trayPos : trayPos / 2;
  trayPos = trayBounds.x > screenBounds.width / 2 ? trayPos : trayPos - 1;

  let DEFAULT_MARGIN = { x: margin_x, y: trayBounds.height / 2 + margin_y };
  let x;
  let y;

  //calculate the new window position
  switch (trayPos) {
    case 1: // for TOP - LEFT
      x = Math.floor(trayBounds.x + DEFAULT_MARGIN.x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y + DEFAULT_MARGIN.y + trayBounds.height / 2);
      break;

    case 2: // for TOP - RIGHT
      x = Math.floor(
        trayBounds.x - width / 2 - DEFAULT_MARGIN.x + trayBounds.width / 2,
      );
      y = Math.floor(trayBounds.y + DEFAULT_MARGIN.y + trayBounds.height / 2);
      break;

    case 3: // for BOTTOM - LEFT
      x = Math.floor(trayBounds.x + DEFAULT_MARGIN.x + trayBounds.width / 2);
      y = Math.floor(
        trayBounds.y - height - DEFAULT_MARGIN.y + trayBounds.height / 2,
      );
      break;

    case 4: // for BOTTOM - RIGHT
      x = Math.floor(
        trayBounds.x - width / 2 - DEFAULT_MARGIN.x + trayBounds.width / 2,
      );
      y = Math.floor(
        trayBounds.y - height - DEFAULT_MARGIN.y + trayBounds.height / 2,
      );
      break;
  }

  return { x: x, y: y };
}

Menu.setApplicationMenu(null);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set logo to disconnected (red)
  const icon = nativeImage.createFromPath(logoDisconnected);
  tray = new Tray(icon);
  tray.setToolTip('Civitai Link');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
  tray.on('click', (event) => {
    if (event.ctrlKey) {
      tray.popUpContextMenu(contextMenu);
    } else {
      toggleWindow();
    }
  });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.civitai.link');

  checkModelsFolder();
  createWindow();
  socketIOConnect({ mainWindow, app });
  // folderWatcher();
  eventsListeners({ mainWindow });
  setWindowAutoHide();

  ipcMain.handle('get-resource-path', (_, type: ResourceType) => {
    return getResourcePath(type);
  });

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });

    // Fix closed window when dialog takes focus Windows
    mainWindow.show();

    if (canceled) {
      return;
    } else {
      return filePaths[0];
    }
  });

  // Updates activities in the UI when a change is detected
  store.onDidChange('activitiesList', (newValue) => {
    mainWindow.webContents.send('activity-update', newValue);
  });

  // Updates all files once changed (Happens when file finishes download)
  store.onDidChange('resources', (newValue) => {
    mainWindow.webContents.send('files-update', newValue);
  });

  // Updates the UI and Tray icon with the socket connection status
  store.onDidChange('connectionStatus', async (newValue) => {
    let icon;

    if (newValue === ConnectionStatus.CONNECTED) {
      icon = nativeImage.createFromPath(logoConnected);
    } else if (newValue === ConnectionStatus.DISCONNECTED) {
      icon = nativeImage.createFromPath(logoDisconnected);
    } else if (newValue === ConnectionStatus.CONNECTING) {
      icon = nativeImage.createFromPath(logoPending);
    }

    tray.setImage(icon);
    mainWindow.webContents.send('connection-status', newValue);
  });

  store.onDidChange('settings', (newValue) => {
    mainWindow.webContents.send('settings-update', newValue);
  });

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
