import path from 'path';
import { getResourcePath } from '../store/paths';
import { deleteFile, searchFile } from '../store/files';
import { updateActivity } from '../store/activities';
import fs from 'fs';
import { filterResourcesList } from './filter-reources-list';

export function resourcesRemove(hash: string) {
  const resource = searchFile(hash);
  const defaultResourcePath = getResourcePath(resource.type);
  const timestamp = new Date().toISOString();
  const resourcePath =
    resource.localPath || path.join(defaultResourcePath, resource.name);

  try {
    // Remove from disk
    fs.unlinkSync(resourcePath);
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
