import chokidar from 'chokidar';
import { getAllPaths, getRootResourcePath, store } from './store/paths';
import {
  addFile,
  deleteFile,
  findFileByFilename,
  searchFile,
  updateFile,
} from './store/files';
import path from 'path';
import { socket, socketCommandStatus } from './socket';
import { getWindow } from './browser-window';
import { getModelByHash } from './civitai-api';
import { checkMissingFields } from './utils/check-missing-fields';
import { addNotFoundFile, searchNotFoundFile } from './store/not-found';
import workerpool from 'workerpool';
import os from 'os';
import { getApiKey } from './store/store';
import { listDirectories } from './list-directory';
import { filterResourcesList } from './commands/filter-reources-list';
import { fetchVaultModelsByVersion } from './civitai-api';
import { diffDirectories } from './store/startup-files';

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

export async function initFolderCheck() {
  // Init load is empty []
  const files = listDirectories();
  const apiKey = getApiKey();
  // const totalModels = files.length;
  // let loadedModels = 0;

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

  // ModelVersionId for vault
  // { modelVersionId: hash }
  let modelVersionIds: Record<number, string> = {};

  // Set initial loading state
  // getWindow().webContents.send('model-loading', {
  //   totalModels,
  //   loadedModels: 0,
  //   isLoading: true,
  // });

  const promises = files.map(async ({ pathname, filename }) => {
    onAdd(pathname);

    if (apiKey) {
      const resource = findFileByFilename(filename);
      if (resource?.modelVersionId && apiKey) {
        modelVersionIds = {
          ...modelVersionIds,
          [resource.modelVersionId]: resource.hash,
        };
      }
    }
  });

  // TODO: This doesnt really await the hashing since its offloaded
  // We dont need to return results
  await processPromisesBatch(promises, 5);

  if (apiKey) {
    // Build array of modelVersionIds
    const modelVersionIdsArray = Object.keys(modelVersionIds).map((key) =>
      Number(key),
    );

    if (modelVersionIdsArray.length !== 0) {
      const vault = await fetchVaultModelsByVersion(modelVersionIdsArray);

      vault.forEach((model) => {
        const hash = modelVersionIds[model.modelVersionId];
        const file = searchFile(hash);
        updateFile({
          ...file,
          modelVersionId: model.modelVersionId,
          vaultId: model.vaultItem?.vaultId,
        });
      });
    }
  }

  // getWindow().webContents.send('model-loading', {
  //   totalModels,
  //   loadedModels: totalModels,
  //   isLoading: false,
  // });

  return;
}

export async function processPromisesBatch(
  items: Array<any>,
  limit: number,
): Promise<any> {
  const itemsLength = items.length;
  for (let start = 0; start < itemsLength; start += limit) {
    const end = start + limit > itemsLength ? itemsLength : start + limit;

    await Promise.allSettled(items.slice(start, end));

    // Update Civitai website with added files
    const newPayload = filterResourcesList();
    socket.emit('commandStatus', {
      type: 'resources:list',
      resources: newPayload,
    });
  }

  return;
}
