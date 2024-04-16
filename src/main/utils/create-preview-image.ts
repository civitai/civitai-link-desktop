import path from 'path';
import fs from 'fs';
import axios from 'axios';

export async function createPreviewImage(file: Resource) {
  if (!file.previewImageUrl || !file.localPath) return;

  const previewPath = path.resolve(
    __dirname,
    file.localPath?.split('.').slice(0, -1).join('.') + '.preview.png',
  );

  if (fs.existsSync(previewPath)) return;

  const writer = fs.createWriteStream(previewPath);

  const response = await axios({
    url: file.previewImageUrl,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
