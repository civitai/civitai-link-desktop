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
  screen,
} from 'electron';
import { join } from 'path';
import logo from '../../resources/favicon@2x.png?asset';
import {
  getUIStore,
  getUpgradeKey,
  setRootResourcePath,
  setKey,
  clearSettings,
  store,
  getRootResourcePath,
  ConnectionStatus,
  setResourcePath,
  getResourcePath,
} from './store';
import chokidar from 'chokidar';
import { socketIOConnect, socketEmit, socketCommandStatus } from './socket';
import { resourcesRemove } from './commands';
import { checkModelsFolder } from './check-models-folder';
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
let framed = false;

const DEBUG = import.meta.env.MAIN_VITE_DEBUG === 'true' || false;
const browserWindowOptions = DEBUG
  ? {
      show: false,
      titleBarOverlay: true,
    }
  : {
      show: true,
      frame: framed,
      fullscreenable: false,
      useContentSize: true,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
    };

function createWindow() {
  const upgradeKey = getUpgradeKey();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    maxWidth: width,
    useContentSize: true,
    resizable: false,
    ...browserWindowOptions,
    ...(process.platform === 'linux' ? { logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
    icon: logo,
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
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
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
    return;
  }

  showWindow();
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
      x = Math.floor(
        trayBounds.x - width - DEFAULT_MARGIN.x + trayBounds.width / 2,
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
        trayBounds.x - width - DEFAULT_MARGIN.x + trayBounds.width / 2,
      );
      y = Math.floor(
        trayBounds.y - height - DEFAULT_MARGIN.y + trayBounds.height / 2,
      );
      break;
  }

  return { x: x, y: y };
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set logo to disconnected (red)
  const icon = nativeImage.createFromPath(logoDisconnected);
  tray = new Tray(icon);
  tray.setToolTip('Civitai Link');
  tray.on('click', () => {
    toggleWindow();
  });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  checkModelsFolder();
  createWindow();
  socketIOConnect({ mainWindow, app });

  ipcMain.on('set-key', (_, key) => {
    console.log('Setting key', key);
    setKey(key);
    socketEmit({
      eventName: 'join',
      payload: key,
      cb: () => {
        console.log(`Joined room ${key}`);
      },
    });
  });

  ipcMain.on('resource-remove', (_, resource: Resource) => {
    const updatedResources = resourcesRemove(resource.hash);
    socketCommandStatus({
      type: 'resources:remove',
      status: 'success',
      resource,
    });
    socketCommandStatus({
      type: 'resources:list',
      resources: updatedResources,
    });
    mainWindow.webContents.send('resource-remove', {
      resource,
    });
  });

  ipcMain.on('set-root-path', (_, directory) => {
    if (directory['path'] !== '') {
      setRootResourcePath(directory['path']);
    }
  });

  ipcMain.on('set-path', (_, directory) => {
    if (directory['path'] !== '') {
      setResourcePath(directory['type'], directory['path']);
    }
  });

  ipcMain.handle('get-resource-path', (_, type: ResourceType) => {
    return getResourcePath(type);
  });

  ipcMain.on('clear-settings', () => {
    clearSettings();
  });

  ipcMain.on('close-app', async () => {
    console.log('Closing app');
    app.quit();
  });

  ipcMain.on('open-root-model-folder', () => {
    const rootResourcePath = getRootResourcePath();
    if (rootResourcePath) {
      shell.openPath(rootResourcePath);
    }
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
  const rootResourcePath = getRootResourcePath();

  if (rootResourcePath && rootResourcePath !== '') {
    // @ts-ignore
    watcher = chokidar
      .watch(rootResourcePath, { ignored: /(^|[\/\\])\../ })
      .on('add, unlink', (event, path) => {
        console.log('Watching model directory: ', rootResourcePath);
        console.log(event, path);
        // Generate hash from file

        // event === 'add'
        // Lookup hash in store
        // Add if doesnt exist

        // const resourceList = resourcesList();
        // socketCommandStatus({ type: 'resources:list', resources: resourceList });
        // resources.append({'type': type, 'name': name, 'hash': hash, 'path': filename, 'hasPreview': has_preview(filename), 'hasInfo': has_info(filename) })

        // event === 'unlink'
        // Remove hash from store
        // TODO: This wont work because we need to read the file to get the hash
      });
  }

  // This is in case the directory changes
  // We want to stop watching the current directory and start watching the new one
  store.onDidChange('rootResourcePath', async (newValue: unknown) => {
    const path = newValue as string;

    if (path && path !== '') {
      await watcher.close();

      // @ts-ignore
      watcher = chokidar
        .watch(path, { ignored: /(^|[\/\\])\../ })
        .on('add, unlink', (event, path) => {
          console.log(event, path);

          // @ts-ignore
          console.log('Model directory changed to: ', newValue.model);
        });
    }
  });

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
    mainWindow.webContents.send(
      'connection-status',
      ConnectionStatus[newValue as ConnectionStatus],
    );
  });

  if (!DEBUG) {
    setWindowAutoHide();
    alignWindow();
  }

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
