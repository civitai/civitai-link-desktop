import fs from 'fs';
import path from 'path';

export function clearTempFolders() {
  const tempDirPath = path.resolve(__dirname, '', 'temp');
  if (fs.existsSync(tempDirPath)) {
    fs.rmdirSync(tempDirPath, { recursive: true });
  }
}
