import Store, { Schema } from 'electron-store';
import difference from 'lodash/difference';
import { updateFile, findFileByFilename } from './files';

const schema: Schema<Record<string, unknown>> = {
  startupFiles: {
    type: 'array',
    default: [],
  },
};

export const store = new Store({ schema });

export function diffDirectories(filesInDirs: string[]): string[] {
  // Get existing list
  const oldFiles = store.get('startupFiles') as string[];
  store.set('startupFiles', filesInDirs);

  // Short circuit if no files
  if (!oldFiles.length) {
    return [];
  }

  let diff = difference(oldFiles, filesInDirs);

  // Update paths and remove from diff if it exists and just moved
  diff = diff.reduce((acc: string[], file: string) => {
    const resource = findFileByFilename(file);

    if (resource) {
      updateFile({ ...resource, localPath: file });
      return acc;
    }

    return [...acc, file];
  }, []);

  // File no longer on file system
  return diff;
}

export function removeFilesFromStore(files: string[]) {
  const oldFiles = store.get('startupFiles') as string[];
  const newFiles = oldFiles.filter((file) => !files.includes(file));

  store.set('startupFiles', newFiles);
}
