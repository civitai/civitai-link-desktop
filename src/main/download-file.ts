import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { BrowserWindow, Notification, ipcMain } from 'electron';
import { updateActivity, addResource } from './store';
import { resourcesList } from './commands';

type DownloadFileParams = {
  id: string;
  downloadPath: string;
  socket: Socket;
  mainWindow: BrowserWindow;
} & Resource;

export async function downloadFile(params: DownloadFileParams) {
  console.log('Connecting …');
  const controller = new AbortController();
  const { data, headers } = await axios({
    url: params.url,
    method: 'GET',
    responseType: 'stream',
    signal: controller.signal,
  });
  const totalLength = parseInt(headers['content-length'], 10);

  console.log('Starting download');
  let elapsed_time = 0;
  const start_time = Date.now();
  let current = 0;
  let speed = current / elapsed_time;
  let remaining_time = (totalLength - current) / speed;
  let progress = (current / totalLength) * 100;
  let downloaded = 0;
  const dirPath = path.resolve(__dirname, '', params.downloadPath);
  const tempDirPath = path.resolve(dirPath, 'temp');
  const tempFilePath = path.resolve(tempDirPath, params.name);
  const filePath = path.resolve(dirPath, params.name);
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
      params.mainWindow.webContents.send(`resource-download:${params.id}`, {
        totalLength,
        downloaded,
        progress,
        speed,
        remainingTime: remaining_time,
        downloading: true,
      });

      // Updates the progress bar
      params.mainWindow.setProgressBar(downloaded / totalLength);

      // Send progress to server
      params.socket.emit('commandStatus', {
        status: 'processing',
        progress,
        remainingTime: remaining_time,
        speed,
        updatedAt: new Date().toISOString(),
        type: 'resources:add',
        id: params.id,
        resource: {
          downloadDate: current_time,
          totalLength,
          hash: params.hash,
          url: params.url,
          type: params.type,
          name: params.name,
          modelName: params.modelName,
          modelVersionName: params.modelVersionName,
        },
      });

      last_reported_time = current_time;
    }
  });

  data.on('end', async function () {
    console.log("Downloaded to: '" + params.downloadPath + "'!");
    const timestamp = new Date().toISOString();

    const fileData = {
      downloadDate: timestamp,
      totalLength,
      hash: params.hash,
      url: params.url,
      type: params.type,
      name: params.name,
      modelName: params.modelName,
      modelVersionName: params.modelVersionName,
      previewImageUrl: params.previewImageUrl,
      civitaiUrl: params.civitaiUrl,
    };

    const activity: ActivityItem = {
      name: params.modelName,
      date: timestamp,
      type: 'downloaded' as ActivityType,
      civitaiUrl: params.civitaiUrl,
    };

    updateActivity(activity);
    addResource(fileData);

    console.log("Move file to: '" + filePath + "'!");
    fs.renameSync(tempFilePath, filePath);

    new Notification({
      title: 'Download Complete',
      body: params.name,
    }).show();

    // Reset progress bar
    params.mainWindow.setProgressBar(-1);

    // Updates the UI with the final progress
    params.mainWindow.webContents.send(`resource-download:${params.id}`, {
      totalLength,
      downloaded,
      progress: 100,
      speed,
      remainingTime: remaining_time,
      downloading: false,
    });

    // Send newly added resource to server
    params.socket.emit('commandStatus', {
      status: 'success',
      progress: 100,
      updatedAt: timestamp,
      resource: fileData,
      id: params.id,
      type: 'resources:add',
    });

    // Send entire list of resources to server
    const newPayload = resourcesList();
    params.socket.emit('commandStatus', {
      type: 'resources:list',
      resources: newPayload,
    });
  });

  data.pipe(writer);

  ipcMain.on('cancel-download', (_, id) => {
    if (params.id === id) {
      console.log('Download canceled');

      // Abort download w/ Axios
      controller.abort();

      params.mainWindow.setProgressBar(-1);

      // Let server know its canceled
      params.socket.emit('commandStatus', {
        status: 'canceled',
        id: params.id,
      });

      // Remove from temp folder
      fs.unlinkSync(tempFilePath);
    }
  });
}
