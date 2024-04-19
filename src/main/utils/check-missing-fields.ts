import { getModelByHash } from '../civitai-api';
import { updateFile } from '../store/files';
import { fileStats } from './file-stats';

const apiFields = ['baseModel', 'trainedWords', 'previewImage'];
const systemFields = ['fileSize', 'downloadDate'];

export async function checkMissingFields(
  resource: Resource,
  localPath: string,
) {
  let fieldsToUpdate = { ...resource, localPath };

  const isMissingApiField = apiFields.find((field) => {
    if (!resource[field]) {
      return true;
    }

    return false;
  });

  const isMissingSystemField = systemFields.find((field) => {
    if (!resource[field]) {
      return true;
    }

    return false;
  });

  if (isMissingApiField) {
    const model = await getModelByHash(resource.hash);

    fieldsToUpdate = { ...fieldsToUpdate, ...model };
  }

  if (isMissingSystemField) {
    const stats = await fileStats(localPath);

    fieldsToUpdate = { ...fieldsToUpdate, ...stats };
  }

  if (localPath || isMissingApiField || isMissingSystemField) {
    updateFile(fieldsToUpdate);
  }
}
