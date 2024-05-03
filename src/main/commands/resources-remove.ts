import path from 'path';
import fs from 'fs';
import { getResourcePath } from '../store/paths';
import { deleteFile, searchFile } from '../store/files';
import { updateActivity } from '../store/activities';
import { filterResourcesList } from './filter-reources-list';
import { getUrlExtension } from '../utils/get-url-extension';

export function resourcesRemove(hash: string) {
  const resource = searchFile(hash.toLowerCase());
  const defaultResourcePath = getResourcePath(resource.type);
  const timestamp = new Date().toISOString();
  const resourcePath =
    resource.localPath || path.join(defaultResourcePath, resource.name);

  try {
    // Remove model from disk
    if (fs.existsSync(resourcePath)) fs.unlinkSync(resourcePath);

    if (resource.previewImageUrl) {
      // Remove thumbnail from disk
      const extension = getUrlExtension(resource.previewImageUrl);
      const previewPath =
        resourcePath.split('.').slice(0, -1).join('.') +
        '.preview.' +
        extension;
      if (fs.existsSync(previewPath)) fs.unlinkSync(previewPath);
    }

    // Remove json data from disk
    const jsonPath = resourcePath.split('.').slice(0, -1).join('.') + '.json';
    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
  } catch (e) {
    console.error('Error removing resource from disk', e);
  }

  // Remove from resources and activity
  deleteFile(hash);

  const activity: ActivityItem = {
    name: resource.modelName,
    date: timestamp,
    type: 'deleted' as ActivityType,
    civitaiUrl: resource.civitaiUrl,
  };

  updateActivity(activity);

  // Return resource list
  return filterResourcesList();
}
