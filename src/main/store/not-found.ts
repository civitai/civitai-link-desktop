import Store, { Schema } from 'electron-store';
import path from 'path';

const NOT_FOUND_RETRY_INTERVAL = 7 * 24 * 60 * 60 * 1000;

type NotFoundFile = {
  hash: string;
  path: string;
  lastScannedDate: string | Date;
  confirmed?: boolean;
};

const schema: Schema<Record<string, unknown>> = {
  notFoundFile: {
    type: 'object',
    default: {},
  },
};

export const store = new Store({ schema });

export function addNotFoundFile(filepath: string, hash: string) {
  const filename = path.basename(filepath);
  store.set(`notFoundFile.${filename}`, {
    hash,
    path: filepath,
    lastScannedDate: new Date().toISOString(),
    confirmed: true,
  });
}

export function removeNotFoundFile(filename: string) {
  filename = path.basename(filename);
  store.delete(`notFoundFile.${filename}`);
}

export function searchNotFoundFile(filename: string) {
  filename = path.basename(filename);
  const key = `notFoundFile.${filename}`;
  const entry = store.get(key) as NotFoundFile | undefined;

  if (!entry) return undefined;

  const lastScannedDate = new Date(entry.lastScannedDate).getTime();
  const isFresh =
    Number.isFinite(lastScannedDate) &&
    Date.now() - lastScannedDate < NOT_FOUND_RETRY_INTERVAL;

  // Entries written by older versions may represent transient API failures.
  // Retry those once, and periodically retry confirmed 404s in case the model
  // is added to Civitai later.
  if (!entry.confirmed || !isFresh) {
    store.delete(key);
    return undefined;
  }

  return entry;
}

export function getNotFoundFiles() {
  return store.get('notFoundFile') as Record<string, NotFoundFile>;
}
