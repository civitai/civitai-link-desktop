import fs from 'fs';
import path from 'path';
import uniqBy from 'lodash/uniqBy';
import { getAllPaths, getRootResourcePath } from './store/paths';

const FILE_TYPES = ['.pt', '.safetensors', '.ckpt', '.bin'];

export function listDirectory() {
  const modelDirectory = getRootResourcePath();
  const modelDirectories = getAllPaths();

  if (!modelDirectory) {
    return [];
  }

  const filesInDirs = modelDirectories
    .map((dir) => {
      if (!fs.existsSync(dir)) return [];

      return fs
        .readdirSync(dir)
        .filter((file) => !file.includes('/temp/'))
        .filter((file) => !file.includes('/.json/'))
        .filter((file) => !file.includes('/.png/'))
        .filter((file) => FILE_TYPES.some((x) => file.includes(x)))
        .map((file) => {
          return { pathname: path.join(dir, file), filename: file };
        });
    })
    .flat();

  return uniqBy(filesInDirs, 'pathname');
}
