import { BrowserWindow, ipcMain } from 'electron';
import { eventSetKey } from './set-key';
import { eventOpenRootModelFolder } from './open-root-model-folder';
import { eventCloseApp } from './close-app';
import { eventClearSettings } from './clear-settings';
import { eventSetRootPath } from './set-root-path';
import { eventSetPath } from './set-path';
import { eventResourceRemove } from './resource-remove';
import { eventInit } from './init';
import { eventSetNSFW } from './set-nsfw';
import { eventOpenModelFileFolder } from './open-model-file-folder';
import { eventSetApiKey } from './set-api-key';
import { eventFetchVaultMeta } from './fetch-vault-meta';
import { eventToggleVaultItem } from './toggle-vault-item';
import { eventFetchVaultModels } from './fetch-vault-models';
import { eventSetStableDiffusion } from './set-stable-diffusion';
import { eventSearchFile } from './search-file';
import { app } from 'electron';
import { eventFetchMetadata } from './fetch-metadata';

type eventsListenersParams = {
  mainWindow: BrowserWindow;
};

export function eventsListeners({ mainWindow }: eventsListenersParams) {
  // App events
  ipcMain.on('init', () => {
    mainWindow.setMinimumSize(1060, 600);
    mainWindow.setSize(1060, 600, true);
    eventInit();
  });
  ipcMain.on('restart-app', () => {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
    app.exit(0);
  });
  ipcMain.on('clear-settings', () => {
    mainWindow.setMinimumSize(400, 600);
    mainWindow.setSize(400, 600, true);
    eventClearSettings();
  });
  ipcMain.on('close-app', eventCloseApp);

  // Set data
  ipcMain.on('set-key', eventSetKey);
  ipcMain.on('set-root-path', eventSetRootPath);
  ipcMain.on('set-path', eventSetPath);
  ipcMain.on('set-nsfw', eventSetNSFW);
  ipcMain.on('set-api-key', eventSetApiKey);
  ipcMain.on('set-stable-diffusion', eventSetStableDiffusion);

  // Misc
  ipcMain.on('resource-remove', (_, resource) =>
    eventResourceRemove(resource, mainWindow),
  );
  ipcMain.on('open-root-model-folder', eventOpenRootModelFolder);
  ipcMain.on('open-model-file-folder', (_, filePath) =>
    eventOpenModelFileFolder(filePath),
  );
  ipcMain.on('toggle-vault-item', eventToggleVaultItem);
  ipcMain.on('search-file', eventSearchFile);

  // Fetch data
  ipcMain.on('fetch-vault-meta', eventFetchVaultMeta);
  ipcMain.on('fetch-vault-models', eventFetchVaultModels);
  ipcMain.handle('fetch-metadata', eventFetchMetadata);
}
