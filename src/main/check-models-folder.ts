import { getModelByHash } from './civitai-api';
import { hash } from './hash';
import { listDirectory } from './list-directory';
import { addResource, getRootResourcePath, lookupResource } from './store';
import path from 'path';

export function checkModelsFolder() {
  const modelDirectory = getRootResourcePath();
  const files = listDirectory();

  files.forEach(async (file) => {
    // TODO: Check all dirs in modelDirectory
    const filePath = path.join(modelDirectory, 'Lora', file);
    // Hash files
    const modelHash = await hash(filePath);

    // Check if exists in store
    const resource = lookupResource(modelHash);

    // If not, fetch from API and add to store
    if (!resource) {
      const model = await getModelByHash(modelHash);

      addResource(model);
    }
  });
}
