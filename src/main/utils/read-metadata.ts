import fs from 'fs';

export async function readMetadata(
  filePath: string,
): Promise<Record<string, any>> {
  const file = await fs.readFileSync(filePath);

  const metadataLenBytes = await file.buffer.slice(0, 8);
  const metadataLen = new DataView(metadataLenBytes).getUint32(0, true);

  if (metadataLen <= 2) {
    throw new Error(`${filePath} is not a safetensors file`);
  }

  const jsonStartBytes = await file.buffer.slice(8, 10);
  const jsonStartStr = new TextDecoder().decode(jsonStartBytes);
  if (!["{'", '{"'].includes(jsonStartStr)) {
    throw new Error(`${filePath} is not a safetensors file`);
  }

  const jsonDataBytes = await file.buffer.slice(10, 10 + metadataLen - 2);
  const jsonDataStr = jsonStartStr + new TextDecoder().decode(jsonDataBytes);
  const jsonObj = JSON.parse(jsonDataStr);

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

  return res;
}
