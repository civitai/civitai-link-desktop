import chokidar from 'chokidar';
import { stat } from 'fs/promises';
import path from 'path';
import { getWindow } from './browser-window';
import { getModelByHash, ModelNotFoundError } from './civitai-api';
import { hash } from './hash';
import { listDirectories } from './list-directory';
import { socketCommandStatus } from './socket';
import { addFile, deleteFile, findFileByFilename } from './store/files';
import {
  addNotFoundFile,
  FileFingerprint,
  isUnchangedSinceHashed,
  NotFoundFile,
  removeNotFoundFile,
  searchNotFoundFile,
} from './store/not-found';
import { getAllPaths, getRootResourcePath, store } from './store/paths';
import { diffDirectories } from './store/startup-files';
import { setVault } from './store/vault';
import { checkMissingFields } from './utils/check-missing-fields';
import { limitConcurrency } from './utils/concurrency-helpers';
import { fileStats } from './utils/file-stats';
import { formatFileError } from './utils/format-file-error';
import { isModelFile } from './utils/model-files';
import { readModelMetadata } from './utils/read-metadata';

const SMALL_FILE_SCAN_CONCURRENCY = 2;
const LARGE_FILE_SCAN_CONCURRENCY = 1;

const watchConfig = {
  ignoreInitial: true,
};

let watcher: chokidar.FSWatcher | undefined;

export function folderWatcher() {
  const rootResourcePath = getRootResourcePath();

  // Makes sure a root path is set
  if (rootResourcePath && rootResourcePath !== '') {
    const resourcePaths = getAllPaths();
    watcher = createWatcher(resourcePaths);
  }

  // This is in case the directory changes
  // We want to stop watching the current directory and start watching the new one
  const handlePathUpdate = async () => {
    // Fetch the updated paths
    const updatedResourcePaths = getAllPaths();

    if (updatedResourcePaths) {
      if (watcher) await watcher.close();
      watcher = createWatcher(updatedResourcePaths);
    }
  };
  store.onDidChange('resourcePaths', handlePathUpdate);
  store.onDidChange('rootResourcePath', handlePathUpdate);
}

function createWatcher(paths: string | string[]) {
  return chokidar
    .watch(paths, watchConfig)
    .on('add', (path) => process(path, 'add'))
    .on('unlink', (path) => process(path, 'unlink'));
}

const UNLINK_DELAY = 1000;
const processing: Record<
  string,
  { event: 'add' | 'unlink'; timeout?: NodeJS.Timeout }
> = {};

function process(filepath: string, event: 'add' | 'unlink') {
  const key = path.basename(filepath);

  if (event === 'add') {
    if (processing[key]?.event === 'unlink')
      clearTimeout(processing[key].timeout);
    const timeout = setTimeout(() => delete processing[key], UNLINK_DELAY);
    processing[key] = { event, timeout };
    onAdd(filepath);
  } else if (event === 'unlink') {
    if (processing[key]?.event === 'add') return;
    const timeout = setTimeout(() => onUnlink(filepath), UNLINK_DELAY);
    processing[key] = { event, timeout };
  }
}

function onUnlink(filePath: string) {
  // Short circuit if file isnt a model file
  if (!isModelFile(filePath)) return;

  // Remove file from store
  const resource = findFileByFilename(path.basename(filePath));

  if (!resource) {
    return;
  }

  deleteFile(resource.hash);
  const updatedResources = getAllPaths();

  socketCommandStatus({
    type: 'resources:list',
    resources: updatedResources,
  });

  getWindow().webContents.send('resource-remove', {
    resource,
  });
}

async function onAdd(pathname: string) {
  // Short circuit if file isnt a model file
  if (!isModelFile(pathname)) return;

  // Short circuit if in not found store
  const notFound = searchNotFoundFile(pathname);
  if (notFound) {
    if (!notFound.isStale) return;
    if (await recheckNotFoundFile(pathname, notFound.entry)) return;
  }

  // See if file already exists by filename
  const resource = findFileByFilename(pathname);

  // Update file path and any missing fields
  if (resource) {
    await checkMissingFields(resource, pathname);
  } else {
    await hashFile(pathname);
  }
}

async function getFileFingerprint(
  pathname: string,
): Promise<FileFingerprint | undefined> {
  try {
    const stats = await stat(pathname);
    return { fileSize: stats.size, mtimeMs: stats.mtimeMs };
  } catch {
    return undefined;
  }
}

// Looks a stale not-found entry up again by its stored hash. Returns false
// when the file changed since it was hashed, so the caller re-hashes it.
async function recheckNotFoundFile(pathname: string, entry: NotFoundFile) {
  const fingerprint = await getFileFingerprint(pathname);
  if (!fingerprint || !isUnchangedSinceHashed(entry, fingerprint)) {
    removeNotFoundFile(pathname);
    return false;
  }

  try {
    const model = await getModelByHash(entry.hash);
    const metadata = await readModelMetadata(pathname);
    await addFile({ ...model, localPath: pathname, metadata });
    removeNotFoundFile(pathname);
  } catch (err) {
    if (err instanceof ModelNotFoundError) {
      addNotFoundFile(pathname, entry.hash, fingerprint);
    } else {
      // Keep the stale entry so the next scan retries the lookup.
      console.error(
        'Model lookup failed',
        path.basename(pathname),
        formatFileError(err, pathname),
      );
    }
  }

  return true;
}

const toHash: Record<
  string,
  { fileSize: number; status: 'pending' | 'complete' }
> = {};

async function hashFile(pathname: string) {
  if (toHash[pathname]) return;
  const stats = await fileStats(pathname);
  if (!stats?.fileSize) return;
  const filename = path.basename(pathname);
  toHash[pathname] = { fileSize: stats.fileSize, status: 'pending' };
  updateLoader();

  try {
    // Fingerprint before hashing so an edit during the hash reads as a change.
    const fingerprint = await getFileFingerprint(pathname);
    const modelHash = await hash(pathname);
    const metadata = await readModelMetadata(pathname);

    try {
      const model = await getModelByHash(modelHash);
      await addFile({ ...model, localPath: pathname, metadata });
    } catch (err) {
      if (err instanceof ModelNotFoundError) {
        addNotFoundFile(pathname, modelHash, fingerprint);
        console.info('Model not found', filename);
      } else {
        console.error(
          'Model lookup failed',
          filename,
          formatFileError(err, pathname),
        );
      }
    }
  } catch (err) {
    console.error('Error hashing', filename, formatFileError(err, pathname));
  } finally {
    const entry = toHash[pathname];
    if (entry) {
      entry.status = 'complete';
      updateLoader();
      setTimeout(() => {
        delete toHash[pathname];
        updateLoader();
      }, 30000);
    }
  }
}

function updateLoader() {
  const toScan = Object.values(toHash).reduce((a, b) => a + b.fileSize, 0);
  const scanned = Object.values(toHash)
    .filter((v) => v.status === 'complete')
    .reduce((a, b) => a + b.fileSize, 0);
  const remaining = toScan - scanned;
  getWindow().webContents.send('model-loading', {
    toScan,
    scanned,
    isScanning: remaining > 0,
  });
}

export async function initFolderCheck() {
  // Init load is empty []
  const files = listDirectories();

  // Remove files that are no longer in the directories from our records
  const filesToRemoveFromStore = diffDirectories(
    files.map((file) => file.pathname),
  );
  filesToRemoveFromStore.forEach((pathname) => {
    const file = findFileByFilename(path.basename(pathname));

    if (file) {
      // Remove file from store
      deleteFile(file.hash);
    }
  });

  // Start background processing without blocking startup
  processFilesInBackground(files);
  await setVault();
}

async function processFilesInBackground(files: { pathname: string }[]) {
  const LARGE_FILE_THRESHOLD = 1024 * 1024 * 1024; // 1GB
  const smallFiles: string[] = [];
  const largeFiles: string[] = [];

  // Categorize files by size
  for (const { pathname } of files) {
    try {
      const stats = await fileStats(pathname);
      if (stats.fileSize && stats.fileSize > LARGE_FILE_THRESHOLD) {
        largeFiles.push(pathname);
      } else {
        smallFiles.push(pathname);
      }
    } catch (error) {
      // If we can't get stats, treat as small file
      smallFiles.push(pathname);
    }
  }

  // Send initial model-loading event to indicate scanning is starting
  if (smallFiles.length > 0 || largeFiles.length > 0) {
    getWindow().webContents.send('model-loading', {
      toScan: 0,
      scanned: 0,
      isScanning: true,
    });
  }

  try {
    // Small files use two lanes so hashing can overlap a model lookup.
    if (smallFiles.length > 0) {
      const smallFilePromises = smallFiles.map((pathname) => async () => {
        await onAdd(pathname);
      });
      await limitConcurrency(smallFilePromises, SMALL_FILE_SCAN_CONCURRENCY);
    }

    // Large files stay serial to avoid competing multi-GB disk reads.
    if (largeFiles.length > 0) {
      const largeFilePromises = largeFiles.map((pathname) => async () => {
        await onAdd(pathname);
      });
      await limitConcurrency(largeFilePromises, LARGE_FILE_SCAN_CONCURRENCY);
    }
  } catch (error) {
    console.error('Error during background file processing:', error);
  }
}

export async function cleanupWatcher() {
  try {
    if (watcher) {
      await watcher.close();
      watcher = undefined;
    }
  } catch (error) {
    console.error('Error during watcher cleanup:', error);
  }
}
