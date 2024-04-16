import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { BrowserWindow, Notification, ipcMain } from 'electron';
import { addFile } from './store/files';
import { updateActivity } from './store/activities';
import { filterResourcesList } from './commands/filter-reources-list';

type DownloadFileParams = {
  socket: Socket;
  mainWindow: BrowserWindow;
  resource: Resource;
  downloadPath: string;
};

export async function downloadFile({
  socket,
  mainWindow,
  downloadPath,
  resource,
}: DownloadFileParams) {
  console.log('Connecting …');
  const controller = new AbortController();
  const { data, headers } = await axios({
    url: resource.url,
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
  const dirPath = path.resolve(__dirname, '', downloadPath);
  const tempDirPath = path.resolve(dirPath, 'temp');
  const tempFilePath = path.resolve(tempDirPath, resource.name);
  const filePath = path.resolve(dirPath, resource.name);
  const REPORT_INTERVAL = 1000;
  let last_reported_time = Date.now();

  const newPayload = filterResourcesList();
  socket.emit('commandStatus', {
    type: 'resources:list',
    resources: [
      { ...resource, downloading: true, status: 'processing' },
      ...newPayload,
    ],
  });

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
      mainWindow.webContents.send(`resource-download:${resource.id}`, {
        totalLength,
        downloaded,
        progress,
        speed,
        remainingTime: remaining_time,
        downloading: true,
      });

      // Updates the progress bar
      mainWindow.setProgressBar(downloaded / totalLength);

      // Send progress to server
      socket.emit('commandStatus', {
        status: 'processing',
        progress,
        remainingTime: remaining_time,
        speed,
        updatedAt: new Date().toISOString(),
        type: 'resources:add',
        id: resource.id,
        resource: {
          downloadDate: current_time,
          totalLength,
          ...resource,
        },
      });

      last_reported_time = current_time;
    }
  });

  data.on('end', async function () {
    console.log("Downloaded to: '" + downloadPath + "'!");
    const timestamp = new Date().toISOString();

    const fileData = {
      downloadDate: timestamp,
      totalLength,
      localPath: filePath,
      ...resource,
    };

    const activity: ActivityItem = {
      name: resource.modelName,
      date: timestamp,
      type: 'downloaded' as ActivityType,
      civitaiUrl: resource.civitaiUrl,
    };

    console.log("Move file to: '" + filePath + "'!");
    fs.renameSync(tempFilePath, filePath);

    updateActivity(activity);
    addFile(fileData);

    new Notification({
      title: 'Download Complete',
      body: resource.name,
    }).show();

    // Reset progress bar
    mainWindow.setProgressBar(-1);

    // Updates the UI with the final progress
    mainWindow.webContents.send(`resource-download:${resource.id}`, {
      totalLength,
      downloaded,
      progress: 100,
      speed,
      remainingTime: remaining_time,
      downloading: false,
    });

    // Send newly added resource to server
    socket.emit('commandStatus', {
      status: 'success',
      progress: 100,
      updatedAt: timestamp,
      resource: fileData,
      id: resource.id,
      type: 'resources:add',
    });

    // Send entire list of resources to server
    const newPayload = filterResourcesList();
    socket.emit('commandStatus', {
      type: 'resources:list',
      resources: newPayload,
    });
  });

  data.pipe(writer);

  function cancelDownload(id: string) {
    console.log('test', id);
    if (resource.id === id) {
      console.log('Download canceled', resource.id);

      // Abort download w/ Axios
      controller.abort();

      mainWindow.setProgressBar(-1);

      // Let server know its canceled
      socket.emit('commandStatus', {
        status: 'canceled',
        id: resource.id,
      });

      const newPayload = filterResourcesList();
      socket.emit('commandStatus', {
        type: 'resources:list',
        resources: newPayload,
      });

      const activity: ActivityItem = {
        name: resource.modelName,
        date: new Date().toISOString(),
        type: 'cancelled' as ActivityType,
        civitaiUrl: resource.civitaiUrl,
      };

      updateActivity(activity);

      // Remove from temp folder
      fs.unlinkSync(tempFilePath);
    }
  }

  ipcMain.once('cancel-download', (_, id) => cancelDownload(id));
}
