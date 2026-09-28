import fs from 'fs';
import uniqBy from 'lodash/uniqBy';
import path from 'path';
import { getAllPaths, getRootResourcePath } from './store/paths';
import { isModelFile } from './utils/model-files';

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
        .readdirSync(directory, { recursive: true })
        .filter(filterFileTypes)
        .map((file) => mapFiles(file, directory));
    })
    .flat();

  return uniqBy(filesInDirs, 'pathname');
}

export function listDirectory(directory: string) {
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory, { recursive: true })
    .filter(filterFileTypes)
    .map((file) => mapFiles(file, directory));
}

function filterFileTypes(file: string | Buffer) {
  return isModelFile(file.toString());
}

function mapFiles(file: string | Buffer, directory: string) {
  return {
    pathname: path.join(directory, file.toString()),
    filename: file.toString(),
  };
}
