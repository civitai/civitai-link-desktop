import Store, { Schema } from 'electron-store';
import path from 'path';

const NOT_FOUND_RETRY_INTERVAL = 7 * 24 * 60 * 60 * 1000;

export type NotFoundFile = {
  hash: string;
  path: string;
  lastScannedDate: string | Date;
  confirmed?: boolean;
  // Size and mtime at hash time, so a stale entry can be rechecked by its
  // stored hash instead of re-hashing a file that hasn't changed.
  fileSize?: number;
  mtimeMs?: number;
};

export type FileFingerprint = { fileSize: number; mtimeMs: number };

const schema: Schema<Record<string, unknown>> = {
  notFoundFile: {
    type: 'object',
    default: {},
  },
};

export const store = new Store({ schema });

export function addNotFoundFile(
  filepath: string,
  hash: string,
  fingerprint?: FileFingerprint,
) {
  const filename = path.basename(filepath);
  store.set(`notFoundFile.${filename}`, {
    hash,
    path: filepath,
    lastScannedDate: new Date().toISOString(),
    confirmed: true,
    ...fingerprint,
  });
}

export function removeNotFoundFile(filename: string) {
  filename = path.basename(filename);
  store.delete(`notFoundFile.${filename}`);
}

export function searchNotFoundFile(
  filename: string,
): { entry: NotFoundFile; isStale: boolean } | undefined {
  filename = path.basename(filename);
  const key = `notFoundFile.${filename}`;
  const entry = store.get(key) as NotFoundFile | undefined;

  if (!entry) return undefined;

  // Entries written by older versions may represent transient API failures.
  // Drop those so the file is hashed and looked up again.
  if (!entry.confirmed) {
    store.delete(key);
    return undefined;
  }

  const lastScannedDate = new Date(entry.lastScannedDate).getTime();
  const isStale =
    !Number.isFinite(lastScannedDate) ||
    Date.now() - lastScannedDate >= NOT_FOUND_RETRY_INTERVAL;

  return { entry, isStale };
}

export function isUnchangedSinceHashed(
  entry: NotFoundFile,
  fingerprint: FileFingerprint,
) {
  return (
    entry.fileSize === fingerprint.fileSize &&
    entry.mtimeMs === fingerprint.mtimeMs
  );
}

export function getNotFoundFiles() {
  return store.get('notFoundFile') as Record<string, NotFoundFile>;
}
