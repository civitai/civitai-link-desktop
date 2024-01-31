import fs from 'fs';
import path from 'path';

import { getDirectories } from './store';

export function listDirectory() {
  const modelDirectory = getDirectories().model;
  const files = fs.readdirSync(path.join(modelDirectory, 'Lora')).filter((file) => file.includes('.safetensors'));

  return files;
}
