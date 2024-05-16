import { getModelByHash } from '../civitai-api';
import { updateFile } from '../store/files';
import { fileStats } from './file-stats';

const apiFields = ['baseModel', 'previewImageUrl'];
const systemFields = ['fileSize', 'downloadDate'];

export async function checkMissingFields(
  resource: Resource,
  localPath: string,
) {
  let fieldsToUpdate = { ...resource, localPath };

  const isMissingApiField = apiFields.some((field) => !resource[field]);
  const isMissingSystemField = systemFields.some((field) => !resource[field]);

  if (isMissingApiField) {
    try {
      const model = await getModelByHash(resource.hash);
      fieldsToUpdate = { ...fieldsToUpdate, ...model };
    } catch (err) {}
  }

  if (isMissingSystemField) {
    const stats = await fileStats(localPath);

    fieldsToUpdate = { ...fieldsToUpdate, ...stats };
  }

  if (localPath || isMissingApiField || isMissingSystemField) {
    updateFile({...fieldsToUpdate, name: resource.name});
  }
}
