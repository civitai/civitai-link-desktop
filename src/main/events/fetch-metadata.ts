import { readMetadata } from '../utils/read-metadata';

export async function eventFetchMetadata(_, localPath: string) {
  if (!localPath) return;

  try {
    const data = await readMetadata(localPath);

    return data;
  } catch (error: any) {
    console.error(error);

    if (error.code === 'ENOENT') return { error: 'File not found' };
    if (error.code === 'ERR_FS_FILE_TOO_LARGE')
      return { error: 'File too large to read metadata' };

    return { error: 'Error checking metadata' };
  }
}
