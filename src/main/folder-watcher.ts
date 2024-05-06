import chokidar from 'chokidar';
import { getAllPaths, getRootResourcePath, store } from './store/paths';
import { addFile, deleteFile, findFileByFilename } from './store/files';
import path from 'path';
import { socketCommandStatus } from './socket';
import { getWindow } from './browser-window';
import { getModelByHash } from './civitai-api';
import { checkMissingFields } from './utils/check-missing-fields';
import { addNotFoundFile, searchNotFoundFile } from './store/not-found';
import workerpool from 'workerpool';
import os from 'os';
const maxWorkers = os.cpus().length > 1 ? os.cpus().length - 1 : 1;
const pool = workerpool.pool(__dirname + '/worker.js', { maxWorkers });

console.log('workers', maxWorkers);

const watchConfig = {
  ignored: /^.*\.(?!pt$|safetensors$|ckpt$|bin$)[^.]+$/,
  ignoreInitial: true,
};

// TODO: Merge with check-models-folder.ts
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
      await watcher.close();
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

async function onAdd(filePath: string) {
  const filename = path.basename(filePath);
  const pathname = filePath;

  // Short circuit if in not found store
  const notFoundFile = searchNotFoundFile(filename);

  if (notFoundFile) return;

  // See if file already exists by filename
  const resource = findFileByFilename(path.basename(filename));

  // Update file path and any missing fields
  if (resource) {
    checkMissingFields(resource, pathname);
  } else {
    // Hash files
    pool
      .exec('processTask', [pathname, filename])
      .then(async (modelHash: string) => {
        try {
          const model = await getModelByHash(modelHash);
          addFile({ ...model, localPath: pathname });
        } catch {
          addNotFoundFile(filename, modelHash, pathname);
          console.error('Error hash', modelHash, filename);
        }
      })
      .catch((err) => {
        console.error('Error hashing', err);
      });
  }
}
