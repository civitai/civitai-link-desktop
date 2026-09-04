import fs from 'fs';
import path from 'path';
import { getRootResourcePath } from '../store/paths';

export function clearTempFolders() {
  const rootResourcePath = getRootResourcePath();
  if (!rootResourcePath) return;

  const tempDirPath = path.resolve(rootResourcePath, 'tmp');

  if (fs.existsSync(tempDirPath)) {
    fs.rmSync(tempDirPath, { recursive: true });
  }
}
