import chokidar from 'chokidar';
import { getRootResourcePath, store } from './store/paths';

export function folderWatcher() {
  let watcher;

  const rootResourcePath = getRootResourcePath();
  // TODO: Need to check all folders

  if (rootResourcePath && rootResourcePath !== '') {
    watcher = chokidar
      .watch(rootResourcePath, { ignored: /(^|[\/\\])\../ })
      .on('add', (path) => console.log(`File ${path} has been added`)) // Could use this as the init for loading dir checks
      // .on('change', (path) => console.log(`File ${path} has been changed`)) // Moving files adds and unlinks
      .on('unlink', (path) => console.log(`File ${path} has been removed`));
  }

  // This is in case the directory changes
  // We want to stop watching the current directory and start watching the new one
  store.onDidChange('rootResourcePath', async (newValue: unknown) => {
    const path = newValue as string;

    if (path && path !== '') {
      await watcher.close();

      // @ts-ignore
      watcher = chokidar
        .watch(path, { ignored: /(^|[\/\\])\../ })
        .on('add, unlink', (event, path) => {
          console.log(event, path);

          // @ts-ignore
          console.log('Model directory changed to: ', newValue.model);
        });
    }
  });
}
