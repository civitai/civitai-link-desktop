import { searchFile } from '../store/files';

export function eventGetFileByHash(_, hash: string) {
  return searchFile(hash);
}
