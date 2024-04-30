import Store, { Schema } from 'electron-store';
import difference from 'lodash/difference';

const schema: Schema<Record<string, unknown>> = {
  files: {
    type: 'array',
    default: [],
  },
};

export const store = new Store({ schema });

export function diffDirectories(
  oldFiles: string[],
  newFiles: string[],
): string[] {
  // Get existing list
  // diff against new list
  // store new list
  const diff = difference(oldFiles, newFiles);

  return diff;
}
