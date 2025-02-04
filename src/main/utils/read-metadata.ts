import fs from 'fs';
import { TextDecoder } from 'util';

export async function readMetadata(
  filePath: string,
): Promise<Record<string, any> | string> {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });
    let buffer = Buffer.alloc(0);
    let metadataLen = -1;

    stream.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);

      if (metadataLen === -1 && buffer.length >= 8) {
        // Convert Buffer to Uint8Array explicitly
        const metadataLenBytes = new Uint8Array(buffer.subarray(0, 8));
        metadataLen = new DataView(metadataLenBytes.buffer).getUint32(0, true);

        if (metadataLen <= 2) {
          stream.destroy(new Error(`${filePath} is not a safetensors file`));
          return;
        }
      }

      if (metadataLen !== -1 && buffer.length >= 10 + metadataLen - 2) {
        stream.destroy(); // Stop reading the file

        // Use subarray and new Uint8Array for type-safe conversion
        const jsonStartBytes = new Uint8Array(buffer.subarray(8, 10));
        const jsonStartStr = new TextDecoder().decode(jsonStartBytes);
        if (!["{'", '{"'].includes(jsonStartStr)) {
          reject(new Error(`${filePath} is not a safetensors file`));
          return;
        }

        const jsonDataBytes = new Uint8Array(
          buffer.subarray(10, 10 + metadataLen - 2),
        );
        const jsonDataStr =
          jsonStartStr + new TextDecoder().decode(jsonDataBytes);
        let jsonObj;
        try {
          jsonObj = JSON.parse(jsonDataStr);
        } catch (err) {
          reject(new Error('Failed to parse metadata JSON'));
          return;
        }

        const res: Record<string, any> = {};
        for (const [k, v] of Object.entries(jsonObj['__metadata__'] || {})) {
          res[k] = v;
          if (typeof v === 'string' && v.startsWith('{')) {
            try {
              res[k] = JSON.parse(v);
            } catch (error) {
              // Ignore the error and use the original string
            }
          }
        }

        resolve(res);
      }
    });

    stream.on('error', (err) => {
      if (err) {
        reject('Failed to parse metadata JSON');
      }
    });

    stream.on('close', () => {
      if (metadataLen === -1) {
        reject(new Error('Metadata length not found'));
      }
    });
  });
}
