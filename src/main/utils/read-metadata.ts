import { FileHandle, open } from 'fs/promises';

const SAFETENSORS_HEADER_SIZE = 8;
const MAX_METADATA_SIZE = 100 * 1024 * 1024;

async function readExactly(
  file: FileHandle,
  buffer: Buffer,
  position: number,
): Promise<void> {
  let offset = 0;

  while (offset < buffer.length) {
    const { bytesRead } = await file.read(
      buffer,
      offset,
      buffer.length - offset,
      position + offset,
    );

    if (bytesRead === 0) throw new Error('Unexpected end of file');
    offset += bytesRead;
  }
}

export async function readMetadata(
  filePath: string,
): Promise<Record<string, unknown>> {
  const file = await open(filePath, 'r');

  try {
    const lengthBuffer = Buffer.alloc(SAFETENSORS_HEADER_SIZE);
    await readExactly(file, lengthBuffer, 0);

    const metadataLength = lengthBuffer.readBigUInt64LE();
    if (
      metadataLength <= 2n ||
      metadataLength > BigInt(MAX_METADATA_SIZE) ||
      metadataLength > BigInt(Number.MAX_SAFE_INTEGER)
    ) {
      throw new Error('Invalid safetensors header');
    }

    const metadataBuffer = Buffer.alloc(Number(metadataLength));
    await readExactly(file, metadataBuffer, SAFETENSORS_HEADER_SIZE);

    let parsedMetadata: unknown;
    try {
      parsedMetadata = JSON.parse(metadataBuffer.toString('utf8'));
    } catch {
      throw new Error('Failed to parse metadata JSON');
    }

    if (
      !parsedMetadata ||
      typeof parsedMetadata !== 'object' ||
      Array.isArray(parsedMetadata)
    ) {
      throw new Error('Invalid safetensors metadata JSON');
    }

    const metadataValue = (parsedMetadata as Record<string, unknown>)[
      '__metadata__'
    ];
    if (
      !metadataValue ||
      typeof metadataValue !== 'object' ||
      Array.isArray(metadataValue)
    ) {
      return {};
    }

    const metadata: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadataValue)) {
      let parsedValue = value;
      if (typeof value === 'string' && value.startsWith('{')) {
        try {
          parsedValue = JSON.parse(value);
        } catch {
          // Keep the original string when nested metadata is not JSON.
        }
      }

      // Treat keys such as "__proto__" as data instead of invoking setters
      // inherited from Object.prototype.
      Object.defineProperty(metadata, key, {
        configurable: true,
        enumerable: true,
        value: parsedValue,
        writable: true,
      });
    }

    return metadata;
  } finally {
    await file.close();
  }
}
