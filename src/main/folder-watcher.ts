import chokidar from 'chokidar';
import { getRootResourcePath, store } from './store/store';

export function folderWatcher() {
  let watcher;

  const rootResourcePath = getRootResourcePath();

  if (rootResourcePath && rootResourcePath !== '') {
    // @ts-ignore
    watcher = chokidar
      .watch(rootResourcePath, { ignored: /(^|[\/\\])\../ })
      .on('add, unlink', (event, path) => {
        console.log('Watching model directory: ', rootResourcePath);
        console.log(event, path);
        // Generate hash from file

        // event === 'add'
        // Lookup hash in store
        // Add if doesnt exist

        // const resourceList = resourcesList();
        // socketCommandStatus({ type: 'resources:list', resources: resourceList });
        // resources.append({'type': type, 'name': name, 'hash': hash, 'path': filename, 'hasPreview': has_preview(filename), 'hasInfo': has_info(filename) })

        // event === 'unlink'
        // Remove hash from store
        // TODO: This wont work because we need to read the file to get the hash
      });
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
