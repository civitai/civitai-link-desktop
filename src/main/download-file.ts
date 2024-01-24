import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Socket } from 'socket.io-client';

type DownloadFileParams = {
  name: string;
  url: string;
  downloadPath: string;
  socket: Socket;
};

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

  const writer = fs.createWriteStream(path.resolve(__dirname, '', params.downloadPath, params.name));

  data.on('data', (chunk) => {
    downloaded += chunk.length;
    elapsed_time = Date.now() - start_time;
    speed = downloaded / elapsed_time;
    remaining_time = (totalLength - downloaded) / speed;
    progress = (downloaded / totalLength) * 100;
    console.log('% complted', progress);

    params.socket.emit('commandStatus', {
      status: 'processing',
      progress,
      remainingTime: remaining_time,
      speed,
      updatedAt: new Date().toISOString(),
    });
  });

  data.on('end', function () {
    console.log("Downloaded to: '" + params.downloadPath + "'!");
    params.socket.emit('commandStatus', {
      status: 'success',
      progress,
      remainingTime: remaining_time,
      speed,
      updatedAt: new Date().toISOString(),
    });
  });

  data.pipe(writer);
}
