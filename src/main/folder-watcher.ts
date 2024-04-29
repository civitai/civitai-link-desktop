import chokidar from 'chokidar';
import { getAllPaths, getRootResourcePath, store } from './store/paths';
import { findFileByFilename } from './store/files';
import path from 'path';
import { resourcesRemove } from './commands';
import { socketCommandStatus } from './socket';
import { getWindow } from './browser-window';

const watchConfig = {
  ignored: /(^|[\/\\])\../,
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
      .on('add', (filePath) => console.log(`File ${filePath} has been added`))
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
        .on('add', (filePath) => {
          console.log(filePath);
        })
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

function onAdd() {}

// TODO: Move on functions to own

// Keep track of file names and paths to know at startup if deleted
// If file added then run addFile function
