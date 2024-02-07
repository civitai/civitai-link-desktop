import path from 'path';
import { lookupResource, removeResource, getRootResourcePath, getResourcePath } from '../store';
import fs from 'fs';

export function resourcesRemove(hash: string) {
  const resource = lookupResource(hash);
  const rootPath = getRootResourcePath();
  const resourcePath = getResourcePath(resource.type);

  // Remove from disk
  fs.unlinkSync(path.join(rootPath, resourcePath, resource.name));

  // Remove from store
  removeResource(hash);

  return;
}
