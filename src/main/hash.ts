import { createHash } from 'crypto';
import fs from 'fs';

export async function hash(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const hash = createHash('sha256');
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (err) => {
      reject(err);
    });

    fileStream.on('data', (data) => {
      hash.update(data);
    });

    fileStream.on('end', () => {
      const fileHash = hash.digest('hex').toLowerCase();
      resolve(fileHash);
    });
  });
}
