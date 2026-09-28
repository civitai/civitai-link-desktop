import { createHash } from 'crypto';
import { open } from 'fs/promises';

const HASH_BUFFER_SIZE = 1024 * 1024;

export async function hash(filePath: string): Promise<string> {
  const file = await open(filePath, 'r');
  const fileHash = createHash('sha256');
  const buffer = Buffer.allocUnsafe(HASH_BUFFER_SIZE);

  try {
    let bytesRead = 0;
    do {
      ({ bytesRead } = await file.read(buffer, 0, buffer.length, null));
      if (bytesRead > 0) fileHash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    await file.close();
  }

  return fileHash.digest('hex').toLowerCase();
}
