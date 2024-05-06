import { fetchVaultModelsByVersion, getModelByHash } from './civitai-api';
import { hash } from './hash';
import { listDirectories, listDirectory } from './list-directory';
import { getApiKey } from './store/store';
import {
  addFile,
  deleteFile,
  findFileByFilename,
  searchFile,
  updateFile,
} from './store/files';
import path from 'path';
import { socket } from './socket';
import { filterResourcesList } from './commands/filter-reources-list';
import { checkMissingFields } from './utils/check-missing-fields';
import { addNotFoundFile, searchNotFoundFile } from './store/not-found';
import { diffDirectories } from './store/startup-files';
import { getWindow } from './browser-window';

type CheckModelFolderParams = {
  directory?: string;
};

export async function checkModelsFolder({ directory }: CheckModelFolderParams) {
  const apiKey = getApiKey();

  // Init load is empty []
  // TODO: Figure out how to do this better when folder changing
  const files = directory ? listDirectory(directory) : listDirectories();
  if (!directory) {
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
  }
  // ModelVersionId for vault
  // { modelVersionId: hash }
  let modelVersionIds: Record<number, string> = {};
  const totalModels = files.length;

  // Set initial loading state
  getWindow().webContents.send('model-loading', {
    totalModels,
    loadedModels: 0,
    isLoading: true,
  });
  let loadedModels = 0;

  const promises = files.map(async ({ pathname, filename }) => {
    // Short circuit if in not found store
    const notFoundFile = searchNotFoundFile(filename);

    if (notFoundFile) return;

    // See if file already exists by filename
    const resource = findFileByFilename(path.basename(filename));

    // Update file path and any missing fields
    if (resource) {
      checkMissingFields(resource, pathname);
    }

    if (resource?.modelVersionId && apiKey) {
      modelVersionIds = {
        ...modelVersionIds,
        [resource.modelVersionId]: resource.hash,
      };
    }

    // If not, fetch from API and add to store
    if (!resource) {
      // Hash files
      const modelHash = await hash(pathname);
      console.log('Hashing...', 'File:', filename, 'Hash:', modelHash);

      try {
        const model = await getModelByHash(modelHash);
        addFile({ ...model, localPath: pathname });
        getWindow().webContents.send('model-loading', {
          totalModels,
          loadedModels: loadedModels++,
          isLoading: true,
        });
      } catch {
        addNotFoundFile(filename, modelHash, pathname);
        console.error('Error hash', modelHash, filename);
      }
    }
  });

  // We dont need to return results
  await processPromisesBatch(promises, 5);

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

  getWindow().webContents.send('model-loading', {
    totalModels,
    loadedModels: files.length,
    isLoading: false,
  });

  return;
}

export async function processPromisesBatch(
  items: Array<any>,
  limit: number,
): Promise<any> {
  for (let start = 0; start < items.length; start += limit) {
    const end = start + limit > items.length ? items.length : start + limit;

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
