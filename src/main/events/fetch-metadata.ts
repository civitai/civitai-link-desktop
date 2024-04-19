import { readMetadata } from '../utils/read-metadata';

export async function eventFetchMetadata(_, localPath: string) {
  if (!localPath) return;

  try {
    const data = await readMetadata(localPath);

    return data;
  } catch (error: any) {
    console.error(error);

    if (error.code === 'ENOENT') return 'File not found';
    if (error.code === 'ERR_FS_FILE_TOO_LARGE')
      return 'No readable Metadata is available for this resource';

    return 'No readable Metadata is available for this resource';
  }
}
