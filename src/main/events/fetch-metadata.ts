import { searchFile, updateFile } from '../store/files';
import { readMetadata } from '../utils/read-metadata';

export async function eventFetchMetadata(
  _,
  { localPath, hash }: { localPath: string; hash: string },
) {
  if (!localPath) return;

  try {
    const data = await readMetadata(localPath);

    // Lookup by hash
    const file = searchFile(hash);
    // Update with metadata
    updateFile({ ...file, metadata: data });

    return data;
  } catch (error: unknown) {
    console.error(error);
    const code = (error as NodeJS.ErrnoException).code;

    if (code === 'ENOENT') return 'File not found';
    if (code === 'ERR_FS_FILE_TOO_LARGE')
      return 'No readable Metadata is available for this resource';

    return 'No readable Metadata is available for this resource';
  }
}
