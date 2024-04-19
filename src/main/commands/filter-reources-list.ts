import { getFiles } from '../store/files';

type ResourcesList = {
  type: string;
  hash: string;
  name: string;
  path?: string;
  hasPreview: string;
  downloading?: boolean;
}[];

export function filterResourcesList() {
  const resources = getFiles();
  let resourceList: ResourcesList = [];

  for (const resource of Object.values(resources)) {
    resourceList.push({
      type: resource.type,
      hash: resource.hash,
      name: resource.name,
      path: resource.localPath,
      hasPreview: resource.previewImageUrl || '',
      downloading: resource.downloading,
    });
  }

  return resourceList;
}
