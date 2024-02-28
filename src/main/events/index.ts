import { ipcMain } from 'electron';
import { eventSetKey } from './set-key';
import { eventOpenRootModelFolder } from './open-root-model-folder';
import { eventCloseApp } from './close-app';
import { eventClearSettings } from './clear-settings';
import { eventSetRootPath } from './set-root-path';
import { eventSetPath } from './set-path';

export function eventsListeners() {
  ipcMain.on('set-key', eventSetKey);
  // ipcMain.on('resource-remove', eventResourceRemove);
  ipcMain.on('set-root-path', eventSetRootPath);
  ipcMain.on('set-path', eventSetPath);
  ipcMain.on('clear-settings', eventClearSettings);
  ipcMain.on('close-app', eventCloseApp);
  ipcMain.on('open-root-model-folder', eventOpenRootModelFolder);
}
