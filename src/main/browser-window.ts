import { is } from '@electron-toolkit/utils';
import { BrowserWindow, app, nativeTheme, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import { join } from 'path';
import { syncDock } from './dock';
import { getUIStore, getUpgradeKey } from './store/store';

// Colored Logo Assets
import logo from '../../resources/favicon@2x.png?asset';
import { getActivities } from './store/activities';
import { getFiles } from './store/files';
import { getVault, getVaultMeta } from './store/vault';
import { clearTempFolders } from './utils/clear-temp-folders';

const DEBUG = import.meta.env.MAIN_VITE_DEBUG === 'true' || false;
let mainWindow;
// Only the tray's Quit sets this. It used to start as DEBUG, which made the close button
// quit outright in development — the one behaviour a tray app most needs to be able to
// test, and it cannot be tested from a build that does the opposite.
let isQuiting = false;

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
      DEBUG,
    });

    mainWindow.webContents.send('app-ready', true);
  });

  // Measured on macOS 26 / Electron 32: BrowserWindow.hide() does NOT emit 'hide' — the
  // window goes isVisible() true -> false with zero events — so the Dock policy cannot be
  // driven by them and every site that changes visibility calls syncDock itself.
  mainWindow.on('closed', () => void syncDock());

  mainWindow.on('close', function (event) {
    const platform = process.platform;

    if (!isQuiting && (platform === 'darwin' || platform === 'win32')) {
      event.preventDefault();
      mainWindow.hide();
      void syncDock();
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

  void syncDock();

  return mainWindow;
}

export function setIsQuiting() {
  isQuiting = true;
}

export function getWindow() {
  return mainWindow;
}
