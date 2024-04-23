import { BrowserWindow, ipcMain } from 'electron';
import { app } from 'electron';

// Settings Events
import { eventClearSettings } from './clear-settings';
import { eventSetKey } from './set-key';
import { eventSetRootPath } from './set-root-path';
import { eventSetPath } from './set-path';
import { eventSetNSFW } from './set-nsfw';
import { eventSetApiKey } from './set-api-key';
import { eventSetStableDiffusion } from './set-stable-diffusion';
import { eventSetAlwaysOnTop } from './set-always-on-top';

// App Events
import { eventInit } from './init';
import { eventOpenRootModelFolder } from './open-root-model-folder';
import { eventCloseApp } from './close-app';

// File Events
import { eventResourceRemove } from './resource-remove';
import { eventOpenModelFileFolder } from './open-model-file-folder';
import { eventSearchFile } from './search-file';
import { eventFetchMetadata } from './fetch-metadata';
import { eventFetchFileNotes, eventSaveFileNotes } from './notes';

// Vault Events
import {
  eventFetchVaultModels,
  eventToggleVaultItem,
  eventFetchVaultMeta,
} from './vault';

type eventsListenersParams = {
  mainWindow: BrowserWindow;
};

// TODO: Combine some of the event files
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
  ipcMain.on('set-always-on-top', (_, alwaysOnTop) => {
    mainWindow.setAlwaysOnTop(alwaysOnTop);

    eventSetAlwaysOnTop(alwaysOnTop);
  });
  ipcMain.on('set-api-key', eventSetApiKey);
  ipcMain.on('set-stable-diffusion', eventSetStableDiffusion);
  ipcMain.on('save-file-notes', eventSaveFileNotes);

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
  ipcMain.handle('fetch-file-notes', eventFetchFileNotes);
}
