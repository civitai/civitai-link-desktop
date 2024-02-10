import fs from 'fs';
import path from 'path';

import { getRootResourcePath } from './store';

const FILE_TYPES = ['.pt', '.safetensors', '.ckpt', '.bin'];

export function listDirectory() {
  const modelDirectory = getRootResourcePath();

  if (!modelDirectory) {
    return [];
  }

  const files = fs
    .readdirSync(path.join(modelDirectory, 'Lora'))
    .filter((file) => FILE_TYPES.some((x) => file.includes(x)));

  return files;
}
