import fs from 'fs';
import path from 'path';
import { getRootResourcePath } from '../store/paths';

export function clearTempFolders() {
  const tempDirPath = path.resolve(getRootResourcePath(), 'tmp');

  if (fs.existsSync(tempDirPath)) {
    fs.rmdirSync(tempDirPath, { recursive: true });
  }
}
