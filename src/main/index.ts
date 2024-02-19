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

const DEBUG = import.meta.env.MAIN_VITE_DEBUG === 'true' || false;
const browserWindowOptions = {
  show: true,
  skipTaskbar: true,
  titleBarOverlay: true,
};

function createWindow() {
  const upgradeKey = getUpgradeKey();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    useContentSize: true,
    ...browserWindowOptions,
    ...(process.platform === 'linux' ? { logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
    icon: logo,
    titleBarStyle: 'hidden', // Fix: Set the titleBarStyle to 'hidden'
  });

  mainWindow.on('ready-to-show', () => {
    if (DEBUG) {
      mainWindow.webContents.openDevTools();
    }

    // Pass upgradeKey to window
    if (upgradeKey)
      mainWindow.webContents.send('upgrade-key', { key: upgradeKey });

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set logo to disconnected (red)
  const icon = nativeImage.createFromPath(logoDisconnected);
  tray = new Tray(icon);
  tray.setToolTip('Civitai Link');
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
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

  ipcMain.on('clear-settings', () => {
    clearSettings();
  });

  ipcMain.on('close-app', async () => {
    console.log('Closing app');
    app.quit();
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
    mainWindow.webContents.send('connection-status', newValue);

    let icon;

    if (newValue === ConnectionStatus.CONNECTED) {
      icon = nativeImage.createFromPath(logoConnected);
    } else if (newValue === ConnectionStatus.DISCONNECTED) {
      icon = nativeImage.createFromPath(logoDisconnected);
    } else if (newValue === ConnectionStatus.CONNECTING) {
      icon = nativeImage.createFromPath(logoPending);
    }

    tray.setImage(icon);
  });

  ipcMain.emit('tray-window-ready', { window: mainWindow });

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
