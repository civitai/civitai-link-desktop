import fs from 'fs';
import path from 'path';

import { getDirectories } from './store';

const FILE_TYPES = ['.pt', '.safetensors', '.ckpt', '.bin'];

export function listDirectory() {
  const modelDirectory = getDirectories().model;

  // TODO: This might be breaking
  if (!modelDirectory) {
    return [];
  }

  const files = fs
    .readdirSync(path.join(modelDirectory, 'Lora'))
    .filter((file) => FILE_TYPES.some((x) => file.includes(x)));

  return files;
}
