import { BrowserWindow } from 'electron';
import Store, { Schema } from 'electron-store';
import { createModelJson } from '../utils/create-model-json';
import { createPreviewImage } from '../utils/create-preview-image';
import { fileStats } from '../utils/file-stats';

const schema: Schema<Record<string, unknown>> = {
  files: {
    type: 'object',
    default: {},
  },
};

export const store = new Store({ schema });

export async function addFile(file: Resource) {
  const files = store.get('files') as ResourcesMap;
  const stats = await fileStats(file.localPath);

  const fileToAdd = { ...file, hash: file.hash.toLowerCase(), ...stats };

  createModelJson(file);
  createPreviewImage(file);

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

export function findFileByFilename(filename: string) {
  const files = store.get('files') as ResourcesMap;

  const hash = Object.keys(files).find((hash) => files[hash].name === filename);

  if (!hash) return;

  return files[hash];
}

export function searchFileByModelVersionId(modelVersionId: number) {
  const files = store.get('files') as ResourcesMap;

  const hash = Object.keys(files).find(
    (hash) => files[hash].modelVersionId === modelVersionId,
  );

  if (!hash) return;

  return files[hash];
}

export function updateFile(file: Resource) {
  const files = store.get('files') as ResourcesMap;

  return store.set('files', {
    ...files,
    [file.hash]: file,
  });
}

export function getFiles() {
  const files = store.get('files') as ResourcesMap;
  const sortedFiles = Object.values(files)
    .sort((a, b) => {
      const filteredFileListA = a.downloadDate;
      const filteredFileListB = b.downloadDate;

      if (!filteredFileListA) return 1;
      if (!filteredFileListB) return -1;

      return (
        new Date(filteredFileListB).getTime() -
        new Date(filteredFileListA).getTime()
      );
    })
    .reduce(
      (
        acc: Record<string, Resource>,
        file: Resource,
      ): Record<string, Resource> => {
        return {
          ...acc,
          [file.hash]: file,
        };
      },
      {},
    );

  return sortedFiles;
}

export function clearFiles() {
  store.clear();
}

type watcherFilesParams = {
  mainWindow: BrowserWindow;
};

export function watcherFiles({ mainWindow }: watcherFilesParams) {
  store.onDidChange('files', (newValue) => {
    mainWindow.webContents.send('files-update', newValue);
  });
}
