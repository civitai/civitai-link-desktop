import chokidar from 'chokidar';
import { getAllPaths, getRootResourcePath, store } from './store/paths';
import { addFile, findFileByFilename } from './store/files';
import path from 'path';
import { resourcesRemove } from './commands';
import { socketCommandStatus } from './socket';
import { getWindow } from './browser-window';
import { getModelByHash } from './civitai-api';
import { hash } from './hash';
import { checkMissingFields } from './utils/check-missing-fields';
import { addNotFoundFile, searchNotFoundFile } from './store/not-found';

const watchConfig = {
  ignored: /^.*\.(?!pt$|safetensors$|ckpt$|bin$)[^.]+$/,
  ignoreInitial: true,
};

export function folderWatcher() {
  let watcher;

  const rootResourcePath = getRootResourcePath();
  const resourcePaths = getAllPaths();

  // Makes sure a root path is set
  if (rootResourcePath && rootResourcePath !== '') {
    watcher = chokidar
      .watch(resourcePaths, watchConfig)
      .on('add', onAdd)
      // .on('ready', () => console.log('Initial scan complete. Ready for changes')
      // .on('change', (path) => console.log(`File ${path} has been changed`)) // Moving files adds and unlinks
      .on('unlink', onUnlink);
  }

  // This is in case the directory changes
  // We want to stop watching the current directory and start watching the new one
  store.onDidChange('resourcePaths', async () => {
    // Fetch the updated paths
    const updatedResourcePaths = getAllPaths();

    if (updatedResourcePaths) {
      await watcher.close();

      watcher = chokidar
        .watch(updatedResourcePaths, watchConfig)
        .on('add', onAdd)
        .on('unlink', onUnlink);
    }
  });
}

function onUnlink(filePath: string) {
  // Remove file from store
  const resource = findFileByFilename(path.basename(filePath));

  if (!resource) {
    return;
  }

  const updatedResources = resourcesRemove(resource.hash);

  socketCommandStatus({
    type: 'resources:remove',
    status: 'success',
    resource,
  });

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
  }

  // If not, fetch from API and add to store
  if (!resource) {
    // Hash files
    const modelHash = await hash(pathname);
    console.log('Hashing...', 'File:', filename, 'Hash:', modelHash);

    try {
      const model = await getModelByHash(modelHash);
      addFile({ ...model, localPath: pathname });
    } catch {
      addNotFoundFile(filename, modelHash, pathname);
      console.error('Error hash', modelHash, filename);
    }
  }
}
