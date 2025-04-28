import { is } from '@electron-toolkit/utils';
import { BrowserWindow, app, nativeTheme, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import { join } from 'path';
import { getUIStore, getUpgradeKey } from './store/store';

// Colored Logo Assets
import logo from '../../resources/favicon@2x.png?asset';
import { getActivities } from './store/activities';
import { setupCommons } from './store/common';
import { getFiles } from './store/files';
import { getVault, getVaultMeta } from './store/vault';
import { clearTempFolders } from './utils/clear-temp-folders';

const DEBUG = import.meta.env.MAIN_VITE_DEBUG === 'true' || false;
let mainWindow;
let isQuiting = DEBUG;

//defaults
let width = getUpgradeKey() ? 1060 : 400;
let height = 600;

export function createWindow() {
  const upgradeKey = getUpgradeKey();
  const { settings } = getUIStore();

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
    alwaysOnTop: settings.alwaysOnTop,
  });

  // Prevents dock icon from appearing on macOS
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  mainWindow.on('ready-to-show', () => {
    console.log('Window is ready to show');

    if (DEBUG) {
      mainWindow.webContents.openDevTools();
    }

    // Pass upgradeKey to window
    if (upgradeKey) {
      mainWindow.webContents.send('upgrade-key', { key: upgradeKey });
    }

    console.log('App ready:');

    try {
      new Promise(async (resolve) => {
        const data = {
          ...getUIStore(),
          ...(await setupCommons()),
          vaultMeta: await getVaultMeta(),
          vault: await getVault(),
          files: await getFiles(),
          activities: await getActivities(),
          appVersion: app.getVersion(),
          DEBUG,
        };

        resolve(data);
      }).then((data) => {
        console.log('Store ready:', data);
        mainWindow.webContents.send('store-ready', data);
        mainWindow.webContents.send('app-ready', true);
        console.log('App ready event sent');
      });
    } catch (error) {
      console.error('Error sending store-ready event:', error);
    }
  });

  mainWindow.on('close', function (event) {
    const platform = process.platform;

    if (!isQuiting && (platform === 'darwin' || platform === 'win32')) {
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

  return mainWindow;
}

export function setIsQuiting() {
  isQuiting = true;
}

export function getWindow() {
  return mainWindow;
}
