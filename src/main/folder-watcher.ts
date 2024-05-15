import chokidar from 'chokidar';
import os from 'os';
import path from 'path';
import workerpool from 'workerpool';
import { getWindow } from './browser-window';
import { getModelByHash } from './civitai-api';
import { listDirectories } from './list-directory';
import { socketCommandStatus } from './socket';
import {
  addFile,
  deleteFile,
  findFileByFilename,
} from './store/files';
import { addNotFoundFile, searchNotFoundFile } from './store/not-found';
import { getAllPaths, getRootResourcePath, store } from './store/paths';
import { diffDirectories } from './store/startup-files';
import { setVault } from './store/vault';
import { checkMissingFields } from './utils/check-missing-fields';
import { limitConcurrency } from './utils/concurrency-helpers';
import { fileStats } from './utils/file-stats';

const maxWorkers = os.cpus().length > 1 ? os.cpus().length - 1 : 1;
const pool = workerpool.pool(__dirname + '/worker.js', { maxWorkers });

const watchConfig = {
  ignored: /^.*\.(?!pt$|safetensors$|ckpt$|bin$)[^.]+$/,
  ignoreInitial: true,
};

export function folderWatcher() {
  let watcher;

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
  // Short circuit if in not found store
  const notFoundFile = searchNotFoundFile(pathname);
  if (notFoundFile) return;

  // See if file already exists by filename
  const resource = findFileByFilename(pathname);

  // Update file path and any missing fields
  if (resource) {
    await checkMissingFields(resource, pathname);
  } else {
    await hashFile(pathname);
  }
}


const toHash: Record<string, { fileSize: number, status: 'pending' | 'complete' }> = {};
async function hashFile(pathname: string) {
  if (toHash[pathname]) return;
  const stats = await fileStats(pathname);
  if (!stats?.fileSize) return;
  toHash[pathname] = { fileSize: stats.fileSize, status: 'pending' };
  updateLoader();

  try {
    const modelHash = await pool.exec('processTask', [pathname]);
    try {
      const model = await getModelByHash(modelHash);
      await addFile({ ...model, localPath: pathname });
    } catch (err) {
      addNotFoundFile(pathname, modelHash);
      console.error('Model not found', err);
    } finally {
      toHash[pathname].status = 'complete';
      setTimeout(() => {
        delete toHash[pathname];
        updateLoader();
      }, 30000)
    }
  } catch (err) {
    console.error('Error hashing', err);
  }
}
function updateLoader() {
  const toScan = Object.values(toHash).reduce((a, b) => a + b.fileSize, 0);
  const scanned = Object.values(toHash).filter((v) => v.status === 'complete').reduce((a, b) => a + b.fileSize, 0);
  getWindow().webContents.send('model-loading', {
    toScan,
    scanned,
    isScanning: toScan > 0,
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

  // Check and hash all files
  const promises = files.map(({ pathname }) => async () => {
    await onAdd(pathname);
  });
  await limitConcurrency(promises, pool.maxWorkers);
  await setVault();
}
