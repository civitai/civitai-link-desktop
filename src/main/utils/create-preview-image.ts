import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { getUrlExtension } from './get-url-extension';

export async function createPreviewImage(file: Resource) {
  if (!file.previewImageUrl || !file.localPath) return;
  const extension = getUrlExtension(file.previewImageUrl);
  const previewPath = path.resolve(
    __dirname,
    file.localPath?.split('.').slice(0, -1).join('.') + '.preview.' + extension,
  );

  if (fs.existsSync(previewPath)) return;

  try {
    const response = await axios.get(file.previewImageUrl, {
      responseType: 'arraybuffer',
      timeout: 5000,
    });

    return await fs.promises.writeFile(previewPath, response.data);
  } catch (e) {
    console.error('Error creating preview image', file.previewImageUrl, e);
  }
}
