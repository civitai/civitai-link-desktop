import { getFiles } from '../store/files';

export function resourcesList() {
  const resources = getFiles();
  const resourceList: Resource[] = [];

  for (const resource of Object.values(resources)) {
    resourceList.push(resource);
  }

  return resourceList;
}
