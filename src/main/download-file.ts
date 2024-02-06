import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { BrowserWindow } from 'electron';
import { addActivity } from './store';

type DownloadFileParams = {
  downloadPath: string;
  socket: Socket;
  mainWindow: BrowserWindow;
} & Resource;

export async function downloadFile(params: DownloadFileParams) {
  // TODO: Lookup hash in store before downloading

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
  const filePath = path.resolve(__dirname, '', params.downloadPath, params.name);

  const writer = fs.createWriteStream(filePath);

  data.on('data', (chunk) => {
    downloaded += chunk.length;
    elapsed_time = Date.now() - start_time;
    speed = downloaded / elapsed_time;
    remaining_time = (totalLength - downloaded) / speed;
    progress = (downloaded / totalLength) * 100;

    params.mainWindow.webContents.send(`resource-download:${params.id}`, {
      totalLength,
      downloaded,
      progress,
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
      [params.hash]: {
        downloadDate: timestamp,
        totalLength,
        hash: params.hash,
        url: params.url,
        type: params.type,
        name: params.name,
        modelName: params.modelName,
        modelVersionName: params.modelVersionName,
      },
    };
    addActivity(fileData);

    params.socket.emit('commandStatus', {
      status: 'success',
      progress,
      remainingTime: remaining_time,
      speed,
      updatedAt: timestamp,
    });
  });

  data.pipe(writer);
}
