import Store, { Schema } from 'electron-store';
import difference from 'lodash/difference';
import { findFileByFilename, updateFile } from './files';
import path from 'path';

const schema: Schema<Record<string, unknown>> = {
  startupFiles: {
    type: 'array',
    default: [],
  },
};

export const store = new Store({ schema });

export function diffDirectories(filesInDirs: string[]): string[] {
  // Get existing list
  const oldFiles = [...store.get('startupFiles') as string[]];
  store.set('startupFiles', filesInDirs);
  const filenames = filesInDirs.map((file) => path.basename(file));

  // Short circuit if no files
  if (!oldFiles.length) {
    return [];
  }

  let diff = difference(oldFiles, filesInDirs);

  // Update paths and remove from diff if it exists and just moved
  const toRemove = diff.reduce((acc: string[], file: string) => {
    const wasRemoved = !filenames.includes(path.basename(file));
    if (!wasRemoved) {
      // File was moved, update the path
      const resource = findFileByFilename(file);
      if (resource) {
        updateFile({ ...resource, localPath: file });
        return acc;
      }
    }

    // Otherwise, add to list to remove
    return [...acc, file];
  }, []);

  // File no longer on file system
  return toRemove;
}

export function removeFilesFromStore(files: string[]) {
  const oldFiles = store.get('startupFiles') as string[];
  const newFiles = oldFiles.filter((file) => !files.includes(file));

  store.set('startupFiles', newFiles);
}
