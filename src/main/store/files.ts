import Store, { Schema } from 'electron-store';
import { createModelJson } from '../utils/create-model-json';
import { createPreviewImage } from '../utils/create-preview-image';
import { fileStats } from '../utils/file-stats';
import { getWindow } from '../browser-window';

const schema: Schema<Record<string, unknown>> = {
  files: {
    type: 'object',
    default: {},
  },
};

export const store = new Store({ schema });

export async function addFile(file: Resource) {
  const stats = await fileStats(file.localPath);

  const fileToAdd = { ...file, hash: file.hash.toLowerCase(), ...stats };

  createModelJson(file);
  createPreviewImage(file);

  return store.set(`files.${file.hash.toLowerCase()}`, fileToAdd);
}

export function deleteFile(hash: string) {
  return store.delete(`files.${hash.toLowerCase()}`);
}

export function searchFile(hash: string) {
  return store.get(`files.${hash.toLowerCase()}`) as Resource;
}

export function findFileByFilename(filename: string) {
  console.log('filename:', filename);
  const files = store.get('files') as ResourcesMap;

  const hash = Object.keys(files).find(
    (hash) => files[hash.toLowerCase()].name === filename,
  );

  console.log(hash);

  if (!hash) return;
  console.log(files[hash]);

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
  return store.set(`files.${file.hash.toLowerCase()}`, file);
}

export function getFiles() {
  const files = store.get('files') as ResourcesMap;
  return sortFiles(files);
}

export function clearFiles() {
  store.clear();
}

export function watcherFiles() {
  store.onDidChange('files', (newValue) => {
    getWindow().webContents.send(
      'files-update',
      sortFiles(newValue as ResourcesMap),
    );
  });
}

function sortFiles(files: ResourcesMap) {
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
