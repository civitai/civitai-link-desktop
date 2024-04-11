import { searchFile } from '../store/files';

export function eventSearchFile(_, hash: string) {
  const file = searchFile(hash);

  return file;
}
