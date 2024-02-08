import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { BrowserWindow, Notification } from 'electron';
import { addActivity, addResource } from './store';

type DownloadFileParams = {
  id: string;
  downloadPath: string;
  socket: Socket;
  mainWindow: BrowserWindow;
} & Resource;

export async function downloadFile(params: DownloadFileParams) {
  console.log('Connecting …');
  const { data, headers } = await axios({
    url: params.url,
    method: 'GET',
    responseType: 'stream',
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

  // Creates temp folder if it doesnt exist, also ensures that the main dir exists
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath, { recursive: true });
  }

  const writer = fs.createWriteStream(tempFilePath);

  data.on('data', (chunk) => {
    downloaded += chunk.length;
    elapsed_time = Date.now() - start_time;
    speed = (downloaded / elapsed_time) * 1024;
    remaining_time = (totalLength - downloaded) / speed;
    progress = (downloaded / totalLength) * 100;

    params.mainWindow.webContents.send(`resource-download:${params.id}`, {
      totalLength,
      downloaded,
      progress,
      speed,
      remainingTime: remaining_time,
    });

    params.socket.emit('commandStatus', {
      status: 'processing',
      progress,
      remainingTime: remaining_time,
      speed,
      updatedAt: new Date().toISOString(),
    });
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
    };
    addActivity(fileData);
    addResource(fileData);

    console.log("Move file to: '" + filePath + "'!");
    fs.renameSync(tempFilePath, filePath);

    new Notification({
      title: 'Download Complete',
      body: params.name,
    }).show();

    params.socket.emit('commandStatus', {
      status: 'success',
      progress,
      remainingTime: remaining_time,
      speed,
      updatedAt: timestamp,
      resource: fileData[params.hash],
      id: params.id,
    });
  });

  data.pipe(writer);
}
