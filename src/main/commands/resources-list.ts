import { getResources } from '../store';

export function resourcesList() {
  const resources = getResources();
  let resourceList: Resource[] = [];

  for (const resource of Object.values(resources)) {
    resourceList.push(resource);
  }

  return resourceList;
}
