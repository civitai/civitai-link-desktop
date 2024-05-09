import { autoUpdater } from 'electron-updater';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import log from 'electron-log';
import {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  Tray,
  nativeImage,
  Menu,
} from 'electron';
import {
  store,
  ConnectionStatus,
  setUser,
  watcherUser,
  watchApiKey,
  getUpgradeKey,
} from './store/store';
import { getResourcePath, getRootResourcePath } from './store/paths';
import { socketIOConnect } from './socket';
import { eventsListeners } from './events';
import { folderWatcher, initFolderCheck } from './folder-watcher';

// Colored Logo Assets
import logoConnected from '../../resources/favicon-connected@2x.png?asset';
import logoPending from '../../resources/favicon-pending@2x.png?asset';
import logoDisconnected from '../../resources/favicon-disconnected@2x.png?asset';
import { watcherActivities } from './store/activities';
import {
  setVaultMeta,
  setVault,
  watchVault,
  watchVaultMeta,
} from './store/vault';
import unhandled from 'electron-unhandled';
import { createWindow, getWindow, setIsQuiting } from './browser-window';

unhandled({
  logger: log.error,
  showDialog: false,
});

log.info('Starting App...');

autoUpdater.logger = log;
// @ts-ignore
autoUpdater.logger.transports.file.level = 'info';

let tray;

function toggleWindow() {
  getWindow().isDestroyed() ? createWindow() : showWindow();
}

function showWindow() {
  const mainWindow = getWindow();
  getWindow().isFocused() ? mainWindow.hide() : mainWindow.show();
}

Menu.setApplicationMenu(null);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  const mainWindow = createWindow();

  log.info('App ready');
  // Set logo to disconnected (red)
  const icon = nativeImage.createFromPath(logoDisconnected);
  tray = new Tray(icon);
  tray.setToolTip('Civitai Link');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        setIsQuiting();
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

  if (getUpgradeKey()) {
    initFolderCheck();
  }

  socketIOConnect({ app });
  setUser();
  setVaultMeta();
  setVault();

  // Watchers/Listeners
  folderWatcher();
  eventsListeners();
  watcherActivities();
  watcherUser({ mainWindow });
  watchVault();
  watchApiKey({ mainWindow });
  watchVaultMeta();

  ipcMain.handle('get-resource-path', (_, type: keyof typeof ResourceType) => {
    return getResourcePath(type);
  });

  ipcMain.handle('get-root-path', () => {
    return getRootResourcePath();
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
