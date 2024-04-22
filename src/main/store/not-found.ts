import Store, { Schema } from 'electron-store';

const schema: Schema<Record<string, unknown>> = {
  notFoundFile: {
    type: 'object',
    default: {},
  },
};

export const store = new Store({ schema });

export function addNotFoundFile(filename: string, hash: string, path: string) {
  store.set(`notFoundFile.${filename}`, {
    hash,
    path,
    lastScannedDate: new Date(),
  });
}

export function removeNotFoundFile(filename: string) {
  store.delete(`notFoundFile.${filename}`);
}

export function searchNotFoundFile(filename: string) {
  return store.get(`notFoundFile.${filename}`);
}

export function getNotFoundFiles() {
  return store.get('notFoundFile') as Record<
    string,
    { hash: string; path: string; lastScannedDate: Date }
  >;
}
