import { createHash } from 'crypto';
import fs from 'fs';

export async function hash(filePath: string) {
  const CHUNK_SIZE = 1024 * 1024;
  const hash_sha256 = createHash('sha256');
  const stream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE });

  for await (const data of stream) {
    hash_sha256.update(data);
  }

  return hash_sha256.digest('hex');
}
