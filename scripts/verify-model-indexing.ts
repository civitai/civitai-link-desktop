import assert from 'assert/strict';
import { createHash } from 'crypto';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { hash } from '../src/main/hash';
import {
  isModelFile,
  supportsEmbeddedMetadata,
} from '../src/main/utils/model-files';
import { readMetadata } from '../src/main/utils/read-metadata';

async function main() {
  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'civitai-link-'));

  try {
    const hashPath = path.join(tempDirectory, 'model.ckpt');
    const hashContents = Buffer.from('bounded hashing test');
    await writeFile(hashPath, hashContents);
    assert.equal(
      await hash(hashPath),
      createHash('sha256').update(hashContents).digest('hex'),
    );

    const metadataPath = path.join(tempDirectory, 'model.safetensors');
    const metadataJson = Buffer.from(
      JSON.stringify({
        __metadata__: { author: 'Civitai', nested: '{"value":1}' },
        tensor: { dtype: 'F32', shape: [1], data_offsets: [0, 4] },
      }),
    );
    const metadataLength = Buffer.alloc(8);
    metadataLength.writeBigUInt64LE(BigInt(metadataJson.length));
    await writeFile(
      metadataPath,
      Buffer.concat([metadataLength, metadataJson, Buffer.alloc(4)]),
    );
    assert.deepEqual(await readMetadata(metadataPath), {
      author: 'Civitai',
      nested: { value: 1 },
    });

    const truncatedPath = path.join(tempDirectory, 'truncated.safetensors');
    const truncatedLength = Buffer.alloc(8);
    truncatedLength.writeBigUInt64LE(128n);
    await writeFile(
      truncatedPath,
      Buffer.concat([truncatedLength, Buffer.from('{}')]),
    );
    await assert.rejects(readMetadata(truncatedPath), /Unexpected end of file/);

    assert.equal(isModelFile('MODEL.SAFETENSORS'), true);
    assert.equal(isModelFile('embedding.pth'), true);
    assert.equal(isModelFile('checkpoint.ckpt'), true);
    assert.equal(isModelFile('notes.pt.json'), false);
    assert.equal(isModelFile('not-a-model.pt.preview.png'), false);
    assert.equal(supportsEmbeddedMetadata('MODEL.SAFETENSORS'), true);
    assert.equal(supportsEmbeddedMetadata('embedding.pt'), false);

    console.log('Model indexing verification passed');
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
