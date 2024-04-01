import { fetchVaultModelsByVersion, getModelByHash } from './civitai-api';
import { hash } from './hash';
import { listDirectory } from './list-directory';
import { getApiKey } from './store/store';
import { getRootResourcePath } from './store/paths';
import { addFile, searchFile, updateFile } from './store/files';
import path from 'path';

export async function checkModelsFolder() {
  const apiKey = getApiKey();

  // Init load is null
  const modelDirectory = getRootResourcePath();

  // Init load is empty []
  const files = listDirectory();

  // ModelVersionId for vault
  // { modelVersionId: hash }
  let modelVersionIds: Record<number, string> = {};

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

    if (resource?.modelVersionId && apiKey) {
      modelVersionIds = {
        ...modelVersionIds,
        [resource.modelVersionId]: resource.hash,
      };
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

  const results = await Promise.allSettled(promises);

  // Only check vault if API Key exists
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

  return results;
}
