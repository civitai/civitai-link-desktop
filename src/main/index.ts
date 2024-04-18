import { autoUpdater } from 'electron-updater';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import log from 'electron-log';
import {
  BrowserWindow,
  app,
  ipcMain,
  shell,
  dialog,
  Tray,
  nativeImage,
  Menu,
  nativeTheme,
} from 'electron';
import { join } from 'path';
import {
  getUIStore,
  getUpgradeKey,
  store,
  ConnectionStatus,
  setUser,
  watcherUser,
  watchApiKey,
} from './store/store';
import { getResourcePath } from './store/paths';
import { socketIOConnect } from './socket';
import { checkModelsFolder } from './check-models-folder';
import { eventsListeners } from './events';
// import { folderWatcher } from './folder-watcher';

// Colored Logo Assets
import logo from '../../resources/favicon@2x.png?asset';
import logoConnected from '../../resources/favicon-connected@2x.png?asset';
import logoPending from '../../resources/favicon-pending@2x.png?asset';
import logoDisconnected from '../../resources/favicon-disconnected@2x.png?asset';
import { getActivities, watcherActivities } from './store/activities';
import { getFiles, watcherFiles } from './store/files';
import {
  getVaultMeta,
  setVaultMeta,
  setVault,
  getVault,
  watchVault,
  watchVaultMeta,
} from './store/vault';
import unhandled from 'electron-unhandled';
import { clearTempFolders } from './utils/clear-temp-folders';

unhandled({
  logger: log.error,
  showDialog: false,
});

const DEBUG = import.meta.env.MAIN_VITE_DEBUG === 'true' || false;

log.info('Starting App...');

autoUpdater.logger = log;
// @ts-ignore
autoUpdater.logger.transports.file.level = 'info';

let mainWindow;
let tray;
let isQuiting = DEBUG;

//defaults
let width = getUpgradeKey() ? 1060 : 400;
let height = 600;

function createWindow() {
  const upgradeKey = getUpgradeKey();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minHeight: 600,
    minWidth: 1060,
    show: true,
    useContentSize: false,
    resizable: true,
    hasShadow: true,
    darkTheme: true,
    frame: true,
    titleBarOverlay: {
      color: nativeTheme.shouldUseDarkColors ? '#1a1b1e' : '#fff',
      symbolColor: nativeTheme.shouldUseDarkColors ? '#fff' : '#000',
    },
    ...(process.platform === 'linux' ? { logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false,
    },
    icon: logo,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1b1e' : '#fff',
    titleBarStyle: 'hidden',
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

    mainWindow.webContents.send('store-ready', {
      ...getUIStore(),
      vaultMeta: getVaultMeta(),
      vault: getVault(),
      files: getFiles(),
      activities: getActivities(),
      appVersion: app.getVersion(),
    });

    mainWindow.webContents.send('app-ready', true);
  });

  mainWindow.on('close', function (event) {
    if (!isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    } else {
      clearTempFolders();
    }

    return false;
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

  // Only run updater when not in debug mode
  if (!DEBUG) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

function toggleWindow() {
  mainWindow.isDestroyed() ? createWindow() : showWindow();
}

function showWindow() {
  mainWindow.isFocused() ? mainWindow.hide() : mainWindow.show();
}

Menu.setApplicationMenu(null);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  log.info('App ready');
  // Set logo to disconnected (red)
  const icon = nativeImage.createFromPath(logoDisconnected);
  tray = new Tray(icon);
  tray.setToolTip('Civitai Link');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
    {
      label: 'Dev Tools',
      click: () => mainWindow.webContents.openDevTools(),
    },
  ]);
  tray.on('click', (event) => {
    if (event.ctrlKey) {
      tray.popUpContextMenu(contextMenu);
    } else {
      toggleWindow();
    }
  });
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.civitai.link');

  // Only run on startup after we have a key
  if (getUpgradeKey()) {
    checkModelsFolder();
  }
  createWindow();
  socketIOConnect({ mainWindow, app });
  // folderWatcher();
  setUser();
  setVaultMeta();
  setVault();

  // Watchers/Listeners
  eventsListeners({ mainWindow });
  watcherActivities({ mainWindow });
  watcherFiles({ mainWindow });
  watcherUser({ mainWindow });
  watchVault({ mainWindow });
  watchApiKey({ mainWindow });
  watchVaultMeta({ mainWindow });

  ipcMain.handle('get-resource-path', (_, type: ResourceType) => {
    return getResourcePath(type);
  });

  ipcMain.handle('dialog:openDirectory', async (_, dirPath: string) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      defaultPath: dirPath,
      properties: ['openDirectory', 'createDirectory'],
    });

    // Fix closed window when dialog takes focus Windows
    mainWindow.show();

    if (canceled) {
      return;
    } else {
      return filePaths[0];
    }
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

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });

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

// Try to alleviate window flickering on Windows
app.commandLine.appendSwitch('wm-window-animations-disabled');
