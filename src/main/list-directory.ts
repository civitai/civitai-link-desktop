import fs from 'fs';
import path from 'path';
import uniqBy from 'lodash/uniqBy';
import { getAllPaths, getRootResourcePath } from './store/paths';

const FILE_TYPES = ['.pt', '.safetensors', '.ckpt', '.bin'];
const EXCLUDE_TYPES = ['/temp/', '.json', '.png'];

export function listDirectories() {
  const modelDirectory = getRootResourcePath();
  const modelDirectories = getAllPaths();

  if (!modelDirectory) {
    return [];
  }

  const filesInDirs = modelDirectories
    .map((directory) => {
      if (!fs.existsSync(directory)) return [];

      return fs
        .readdirSync(directory)
        .filter(filterFileTypes)
        .map((file) => mapFiles(file, directory));
    })
    .flat();

  return uniqBy(filesInDirs, 'pathname');
}

export function listDirectory(directory: string) {
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter(filterFileTypes)
    .map((file) => mapFiles(file, directory));
}

function filterFileTypes(file: string) {
  if (EXCLUDE_TYPES.some((x) => !file.includes(x))) {
    return FILE_TYPES.some((x) => file.includes(x));
  } else {
    return true;
  }
}

function mapFiles(file: string, directory: string) {
  return { pathname: path.join(directory, file), filename: file };
}
