import path from 'path';

const MODEL_FILE_EXTENSIONS = new Set([
  '.bin',
  '.ckpt',
  '.pt',
  '.pth',
  '.safetensors',
]);

export function isModelFile(filePath: string) {
  return MODEL_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function supportsEmbeddedMetadata(filePath: string) {
  return path.extname(filePath).toLowerCase() === '.safetensors';
}
