import { getModelByHash } from './civitai-api';
import { hash } from './hash';
import { listDirectory } from './list-directory';
import { getRootResourcePath } from './store/store';
import { addFile, searchFile, updateFile } from './store/files';
import path from 'path';

export function checkModelsFolder() {
  // Init load is null
  const modelDirectory = getRootResourcePath();

  // Init load is empty []
  const files = listDirectory();

  const promises = files.map(async (file) => {
    const filePath = path.join(modelDirectory, file);

    // Hash files
    const modelHash = await hash(filePath);

    // Check if exists in store
    const resource = searchFile(modelHash);

    // In case no path is stored, update it
    if (resource && !resource.localPath) {
      updateFile({ ...resource, localPath: filePath });
    }

    // If not, fetch from API and add to store
    if (!resource) {
      try {
        const model = await getModelByHash(modelHash);
        addFile({ ...model, localPath: filePath });
      } catch {
        console.error('Error hash', modelHash, file);
      }
    }
  });

  return Promise.allSettled(promises);
}
