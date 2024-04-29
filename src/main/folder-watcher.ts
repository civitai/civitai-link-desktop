import chokidar from 'chokidar';
import { getAllPaths, getRootResourcePath, store } from './store/paths';

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
      .on('add', (path) => console.log(`File ${path} has been added`))
      // .on('ready', () => console.log('Initial scan complete. Ready for changes')
      // .on('change', (path) => console.log(`File ${path} has been changed`)) // Moving files adds and unlinks
      .on('unlink', (path) => console.log(`File ${path} has been removed`));
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
        .on('add', (path) => {
          console.log(path);
        })
        .on('unlink', (path) => {
          console.log(`File ${path} has been removed`);
        });
    }
  });
}

// TODO: Move on functions to own
