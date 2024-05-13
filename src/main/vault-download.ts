import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Notification, ipcMain } from 'electron';
import { v4 as uuid } from 'uuid';
import { findOrCreateFolder } from './utils/find-or-create-folder';
import { getWindow } from './browser-window';
import { getApiKey } from './store/store';
import { getRootResourcePath } from './store/paths';

type VaultDownloadParams = {
  resource: {
    url: string;
    name: string;
    id: number;
  };
  downloadPath: string;
};

// Update params
export async function vaultDownload({
  downloadPath,
  resource,
}: VaultDownloadParams) {
  const mainWindow = getWindow();
  const controller = new AbortController();
  const { data, headers } = await axios({
    url: resource.url,
    method: 'GET',
    responseType: 'stream',
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });
  const totalLength = parseInt(headers['content-length'], 10);

  let elapsed_time = 0;
  const start_time = Date.now();
  let current = 0;
  let speed = current / elapsed_time;
  let remaining_time = (totalLength - current) / speed;
  let progress = (current / totalLength) * 100;
  let downloaded = 0;
  const dirPath = path.resolve(__dirname, '', downloadPath);
  const tempDirPath = path.resolve(getRootResourcePath(), 'tmp');
  const tempFileName = uuid();
  const tempFilePath = path.resolve(tempDirPath, tempFileName);
  const filePath = path.resolve(dirPath, resource.name);
  const REPORT_INTERVAL = 1000;
  let last_reported_time = Date.now();

  // Creates temp folder if it doesnt exist, also ensures that the main dir exists
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath, { recursive: true });
  }

  const writer = fs.createWriteStream(tempFilePath);

  data.on('data', (chunk) => {
    const current_time = Date.now();
    downloaded += chunk.length;
    elapsed_time = current_time - start_time;
    speed = (downloaded / elapsed_time) * 1024;
    remaining_time = (totalLength - downloaded) / speed;
    progress = (downloaded / totalLength) * 100;

    if (current_time - last_reported_time > REPORT_INTERVAL) {
      // Updates the UI with the current progress
      mainWindow.webContents.send(`vault-download:${resource.id}`, {
        totalLength,
        downloaded,
        progress,
        speed,
        remainingTime: remaining_time,
        downloading: true,
      });

      // Updates the progress bar
      mainWindow.setProgressBar(downloaded / totalLength);

      last_reported_time = current_time;
    }
  });

  data.on('end', async function () {
    findOrCreateFolder(path.dirname(filePath));

    fs.renameSync(tempFilePath, filePath);

    new Notification({
      title: 'Download Complete',
      body: resource.name,
    }).show();

    // Reset progress bar
    mainWindow.setProgressBar(-1);

    // Updates the UI with the final progress
    mainWindow.webContents.send(`vault-download:${resource.id}`, {
      totalLength,
      downloaded,
      progress: 100,
      speed,
      remainingTime: remaining_time,
      downloading: false,
    });
  });

  data.pipe(writer);

  function cancelDownload(id: number) {
    console.log('test', id);
    if (resource.id === id) {
      console.log('Download canceled', resource.id);

      // Abort download w/ Axios
      controller.abort();

      mainWindow.setProgressBar(-1);

      // Remove from temp folder
      fs.unlinkSync(tempFilePath);
    }
  }

  ipcMain.once('cancel-vault-download', (_, id) => cancelDownload(id));
}
