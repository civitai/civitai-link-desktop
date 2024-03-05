import { getModelByHash } from './civitai-api';
import { hash } from './hash';
import { listDirectory } from './list-directory';
import {
  addResource,
  getRootResourcePath,
  lookupResource,
  updatedResource,
} from './store';
import path from 'path';

export function checkModelsFolder() {
  // Init load is null
  const modelDirectory = getRootResourcePath();
  // Init load is empty []
  const files = listDirectory();

  files.forEach(async (file) => {
    const filePath = path.join(modelDirectory, file);

    // Hash files
    const modelHash = await hash(filePath);

    // Check if exists in store
    const resource = lookupResource(modelHash);

    // In case no path is stored, update it
    if (resource && !resource.localPath) {
      updatedResource({ ...resource, localPath: filePath });
    }

    // If not, fetch from API and add to store
    if (!resource) {
      try {
        const model = await getModelByHash(modelHash);

        addResource({ ...model, localPath: filePath });
      } catch {
        console.error('Error hash', modelHash, file);
      }
    }
  });
}
