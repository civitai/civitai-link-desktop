import { getResourcePath } from '../store/paths';
import { vaultDownload } from '../vault-download';

export function eventDownloadVaultItem(
  _,
  resource: {
    url: string;
    name: string;
    id: number;
    type: string;
  },
) {
  const { type, ...resourceData } = resource;

  // Get download path
  const resourcePath = getResourcePath(type);

  vaultDownload({ downloadPath: resourcePath, resource: resourceData });

  return '';
}
