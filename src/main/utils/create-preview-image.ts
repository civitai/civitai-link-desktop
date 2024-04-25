import path from 'path';
import fs from 'fs';
import electronDl, { download } from 'electron-dl';
import { getWindow } from '../browser-window';

export async function createPreviewImage(file: Resource) {
  if (!file.previewImageUrl || !file.localPath) return;

  const previewPath = path.resolve(
    __dirname,
    file.localPath?.split('.').slice(0, -1).join('.') + '.preview.png',
  );

  if (fs.existsSync(previewPath)) return;

  try {
    await download(getWindow(), file.previewImageUrl, {
      directory: path.dirname(previewPath),
      filename: path.basename(previewPath),
      showBadge: false,
      showProgressBar: false,
    });
  } catch (error) {
    if (error instanceof electronDl.CancelError) {
      console.info('item.cancel() was called');
    } else {
      console.error(error);
    }
  }
}
