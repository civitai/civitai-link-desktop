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

  const response = await axios.get(file.previewImageUrl, {
    responseType: 'arraybuffer',
  });

  return await fs.promises.writeFile(previewPath, response.data);
}
