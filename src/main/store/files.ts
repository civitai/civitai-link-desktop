import { BrowserWindow } from 'electron';
import Store, { Schema } from 'electron-store';

const schema: Schema<Record<string, unknown>> = {
  files: {
    type: 'object',
    default: {},
  },
};

export const store = new Store({ schema });

export function addFile(file: Resource) {
  const files = store.get('files') as ResourcesMap;
  const fileToAdd = { ...file, hash: file.hash.toLowerCase() };

  return store.set('files', {
    [fileToAdd.hash]: fileToAdd,
    ...files,
  });
}

export function deleteFile(hash: string) {
  const files = store.get('files') as ResourcesMap;

  delete files[hash.toLowerCase()];

  return store.set('files', files);
}

export function searchFile(hash: string) {
  const files = store.get('files') as ResourcesMap;

  return files[hash.toLowerCase()];
}

export function updateFile(file: Resource) {
  const files = store.get('files') as ResourcesMap;

  return store.set('files', {
    ...files,
    [file.hash]: file,
  });
}

export function getFiles() {
  return store.get('files') as ResourcesMap;
}

type watcherFilesParams = {
  mainWindow: BrowserWindow;
};

export function watcherFiles({ mainWindow }: watcherFilesParams) {
  store.onDidChange('files', (newValue) => {
    mainWindow.webContents.send('files-update', newValue);
  });
}
