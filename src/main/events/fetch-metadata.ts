import { readMetadata } from '../utils/read-metadata';

export async function eventFetchMetadata(_, localPath: string) {
  if (!localPath) return;

  const data = await readMetadata(localPath);

  return data;
}
