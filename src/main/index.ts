import { electronApp, optimizer } from '@electron-toolkit/utils';
import {
  Menu,
  MenuItemConstructorOptions,
  Tray,
  app,
  dialog,
  ipcMain,
  nativeImage,
} from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { eventsListeners } from './events';
import {
  cleanupWatcher,
  folderWatcher,
  initFolderCheck,
} from './folder-watcher';
import { socketIOConnect } from './socket';
import { getResourcePath, getRootResourcePath } from './store/paths';
import {
  ConnectionStatus,
  getUpgradeKey,
  setUser,
  store,
  watchApiKey,
  watcherUser,
} from './store/store';

// Colored Logo Assets
import unhandled from 'electron-unhandled';
import logoConnected from '../../resources/favicon-connected@2x.png?asset';
import logoDisconnected from '../../resources/favicon-disconnected@2x.png?asset';
import logoPending from '../../resources/favicon-pending@2x.png?asset';
import { createWindow, getWindow, setIsQuiting } from './browser-window';
import { syncDock } from './dock';
import { watcherActivities } from './store/activities';
import {
  setVault,
  setVaultMeta,
  watchVault,
  watchVaultMeta,
} from './store/vault';

// For some reason this needs to be imported like this since the project is not type: module
(async () => {
  const contextMenu = (await import('electron-context-menu')).default;
  contextMenu();
})();

unhandled({
  logger: log.error,
  showDialog: false,
});

// Two copies of the app share one electron-store and race on every key it holds,
// including the instance key. Hand the launch to the copy already running.
const gotInstanceLock = app.requestSingleInstanceLock();
if (!gotInstanceLock) app.quit();

log.info('Starting App...');

autoUpdater.logger = log;
// @ts-ignore
autoUpdater.logger.transports.file.level = 'info';

let tray: Tray | null = null;

function openWindow() {
  const mainWindow = getWindow();

  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }

  revealWindow();
}

// show() alone neither raises a window that is already visible behind another app
// nor restores a minimized one, and on macOS it does not bring the app itself
// forward — which is why the tray icon looked inert.
function revealWindow() {
  const mainWindow = getWindow();

  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  if (process.platform === 'darwin') app.focus({ steal: true });
  void syncDock();
}

function createTray() {
  if (tray) {
    tray.destroy(); // Destroy previous tray to avoid duplication
    tray = null;
  }

  // Set logo to disconnected (red)
  const icon = nativeImage.createFromPath(logoDisconnected);
  tray = new Tray(icon);
  tray.setToolTip('Civitai Link');

  const trayContextMenuItems: MenuItemConstructorOptions[] = [
    {
      label: 'Open Civitai Link',
      click: openWindow,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        setIsQuiting();
        app.quit();
      },
    },
  ];
  if (import.meta.env.MAIN_VITE_DEBUG === 'true') {
    trayContextMenuItems.push({
      label: 'Dev Tools',
      click: () => getWindow().webContents.openDevTools(),
    });
  }
  // Left click opens the menu too, rather than toggling a window — with no Dock icon the
  // menu is the app's only affordance, so hiding Quit behind a right click strands people.
  tray.setContextMenu(Menu.buildFromTemplate(trayContextMenuItems));
}

Menu.setApplicationMenu(null);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  const mainWindow = createWindow();

  log.info('App ready:', {
    version: app.getVersion(),
    platform: process.platform,
    platformVersion: process.getSystemVersion(),
    arch: process.arch,
  });
  createTray();

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.civitai.link');

  socketIOConnect({ app });
  setUser();
  setVaultMeta();
  setVault();

  // Watchers/Listeners
  if (getUpgradeKey()) {
    initFolderCheck();
  }

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

    tray?.setImage(icon);
    mainWindow.webContents.send('connection-status', newValue);
  });

  store.onDidChange('settings', (newValue) => {
    mainWindow.webContents.send('settings-update', newValue);
  });

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-available');
  });

  // Listen for keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (_, input) => {
    if (input.control || input.meta) {
      switch (input.key.toLowerCase()) {
        case 'c':
          mainWindow.webContents.copy();
          break;
        case 'v':
          mainWindow.webContents.paste();
          break;
        case 'x':
          mainWindow.webContents.cut();
          break;
        case 'a':
          mainWindow.webContents.selectAll();
          break;
        case 'z':
          // Ctrl + Shift + Z (Redo)
          if (input.shift) mainWindow.webContents.redo();
          // Ctrl + Z (Undo)
          else mainWindow.webContents.undo();
          break;
      }
    }
  });
});

// Default open or close DevTools by F12 in development
// and ignore CommandOrControl + R in production.
// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window);
});

// Without a listener Electron quits once the last window closes, which for a tray app
// throws away the whole point of the tray. Quit is the tray's Quit item instead.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && process.platform !== 'win32') app.quit();
});

app.on('second-instance', () => {
  openWindow();
});

app.on('activate', function () {
  // The window is hidden rather than destroyed on close, so a dock-icon click
  // usually has one to raise and only needs a new one once it has been destroyed.
  openWindow();
});

app.on('before-quit', async () => {
  log.info('App is quitting, cleaning up watchers...');
  await cleanupWatcher();
});

// Try to alleviate window flickering on Windows
app.commandLine.appendSwitch('wm-window-animations-disabled');
