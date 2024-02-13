import path from 'path';
import { lookupResource, removeResource, getRootResourcePath, getResourcePath, removeActivity } from '../store';
import fs from 'fs';
import { resourcesList } from './resources-list';

export function resourcesRemove(hash: string) {
  const resource = lookupResource(hash);
  const rootPath = getRootResourcePath();
  const resourcePath = getResourcePath(resource.type);

  // Remove from disk
  fs.unlinkSync(path.join(rootPath, resourcePath, resource.name));

  // Remove from resources and activity
  removeResource(hash);
  removeActivity(hash);

  // Return resource list
  return resourcesList();
}
