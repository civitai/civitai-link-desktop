import fs from 'fs';
import path from 'path';
import axios from 'axios';
// const ProgressBar = require('progress');

type DownloadFileParams = {
  url: string;
  downloadPath: string;
};

// This needs to emit its status to the Socket
export async function downloadFile(params: DownloadFileParams) {
  console.log('Connecting …');
  const { data, headers } = await axios({
    url: params.url,
    method: 'GET',
    responseType: 'stream',
  });
  // Convert to MB
  const totalLength = headers['content-length'];

  console.log('Starting download');
  //   const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
  //     width: 40,
  //     complete: '=',
  //     incomplete: ' ',
  //     renderThrottle: 1,
  //     total: parseInt(totalLength),
  //   });

  //   current_time = time.time()
  //   elapsed_time = current_time - start_time
  //   speed = current / elapsed_time
  //   remaining_time = (total - current) / speed
  //   progress = current / total * 100
  //   payload['status'] = 'processing'
  //   payload['progress'] = progress
  //   payload['remainingTime'] = remaining_time
  //   payload['speed'] = speed

  const writer = fs.createWriteStream(path.resolve(__dirname, '', params.downloadPath));

  data.on('data', (chunk) => {
    console.log('% complted', (chunk.length / totalLength) * 100);
  });
  data.pipe(writer);
}
