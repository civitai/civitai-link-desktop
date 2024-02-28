import path from 'path';
import {
  lookupResource,
  removeResource,
  getResourcePath,
  updateActivity,
} from '../store';
import fs from 'fs';
import { resourcesList } from './resources-list';

export function resourcesRemove(hash: string) {
  const resource = lookupResource(hash);
  const resourcePath = getResourcePath(resource.type);
  const timestamp = new Date().toISOString();

  // Remove from disk
  fs.unlinkSync(path.join(resourcePath, resource.name));

  // Remove from resources and activity
  removeResource(hash);

  const activity: ActivityItem = {
    name: resource.modelName,
    date: timestamp,
    type: 'deleted' as ActivityType,
    civitaiUrl: resource.civitaiUrl,
  };

  updateActivity(activity);

  // Return resource list
  return resourcesList();
}
