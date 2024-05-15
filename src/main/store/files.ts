import Store, { Schema } from 'electron-store';
import { createModelJson } from '../utils/create-model-json';
import { createPreviewImage } from '../utils/create-preview-image';
import { fileStats } from '../utils/file-stats';
import { getWindow } from '../browser-window';
import path from 'path';

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
  if (file.localPath) {
    fileToAdd.name = path.basename(file.localPath);
  }

  createModelJson(file);
  createPreviewImage(file);

  store.set(`files.${file.hash.toLowerCase()}`, fileToAdd);

  const files = store.get('files') as ResourcesMap;

  getWindow().webContents.send('files-update', files);

  return;
}

export function deleteFile(hash: string) {
  return store.delete(`files.${hash.toLowerCase()}`);
}

export function searchFile(hash: string) {
  return store.get(`files.${hash.toLowerCase()}`) as Resource;
}

export function findFileByFilename(filename: string) {
  filename = path.basename(filename);
  const files = store.get('files') as ResourcesMap;

  const file = Object.values(files).find(
    (file) => file.name == filename,
  );

  if (!file) return;

  return file;
}

export function searchFileByModelVersionId(modelVersionId: number) {
  const files = store.get('files') as ResourcesMap;

  const hash = Object.keys(files).find(
    (hash) => files[hash.toLowerCase()].modelVersionId === modelVersionId,
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

export function filesByModelVersionIdHash() {
  const files = store.get('files') as ResourcesMap;

  return Object.values(files).reduce(
    (acc: Record<string, Resource>, file: Resource) => {
      if (!file.modelVersionId) return acc;

      return {
        ...acc,
        [file.modelVersionId]: file,
      };
    },
    {},
  );
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
