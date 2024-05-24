import axios from 'axios';
import { Notification, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { getWindow } from './browser-window';
import { getRootResourcePath } from './store/paths';
import { getApiKey, getSettings } from './store/store';
import { findOrCreateFolder } from './utils/find-or-create-folder';

const REPORT_INTERVAL = 1000;

type DownloadChunkParams = {
  url: string;
  start: number;
  end: number;
  index: number;
  tempFilePath: string;
  abortController: AbortController;
  progressCallback: (index: number, loaded: number, total?: number) => void;
};

async function downloadChunk({
  url,
  start,
  end,
  index,
  tempFilePath,
  abortController,
  progressCallback,
}: DownloadChunkParams) {
  const headers = {
    Range: `bytes=${start}-${end}`,
    Authorization: `Bearer ${getApiKey()}`,
  };

  const response = await axios.get(url, {
    headers,
    responseType: 'arraybuffer',
    signal: abortController.signal,
    onDownloadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      progressCallback(index, loaded, total);
    },
  });

  fs.writeFileSync(`${tempFilePath}.part${index}`, response.data);
}

async function getFileSize(url: string) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const response = await axios.get(url, {
      cancelToken: source.token,
      responseType: 'stream',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    });

    // Get the content-length from the headers
    const contentLength = response.headers['content-length'];
    source.cancel('Got the content length, aborting the request');
    return parseInt(contentLength, 10);
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return;
    } else {
      throw error;
    }
  }
}

type VaultDownloadParams = {
  resource: {
    url: string;
    name: string;
    id: number;
  };
  downloadPath: string;
};

export async function vaultDownload({
  downloadPath,
  resource,
}: VaultDownloadParams) {
  const mainWindow = getWindow();

  // Number of parts to split into from settings
  const NUMBER_PARTS = getSettings().concurrent || 10;
  const startTime = performance.now();
  let lastReportedTime = Date.now();

  const fileSize = await getFileSize(resource.url);

  // If the file size is not available, return (maybe throw an error here?)
  if (!fileSize) return;

  const controller = new AbortController();
  const chunkSize = Math.ceil(fileSize / NUMBER_PARTS);

  // Final file path
  const dirPath = path.resolve(__dirname, '', downloadPath);
  const filePath = path.resolve(dirPath, resource.name);

  // Temp file path
  const tempFileName = uuid();
  const tempDirPath = path.resolve(getRootResourcePath(), 'tmp');
  const tempFilePath = path.resolve(tempDirPath, tempFileName);

  // Creates temp folder if it doesnt exist, also ensures that the main dir exists
  if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath, { recursive: true });
  }

  function cancelDownload(id: number) {
    if (resource.id === id) {
      console.log('Download canceled', resource.id);

      // Abort download w/ Axios
      controller.abort();

      mainWindow.setProgressBar(-1);
    }
  }

  ipcMain.once('cancel-vault-download', (_, id) => cancelDownload(id));

  let downloadedBytes = 0;
  const progress = Array(NUMBER_PARTS).fill(0);

  const updateProgress = (index: number, loaded: number) => {
    const currentTime = Date.now();
    downloadedBytes += loaded - progress[index];
    progress[index] = loaded;

    const elapsedTime = (performance.now() - startTime) / 1000; // seconds
    const speed = downloadedBytes / elapsedTime; // bytes per second
    const remainingTime = (fileSize - downloadedBytes) / speed; // seconds

    if (currentTime - lastReportedTime > REPORT_INTERVAL) {
      const totalProgress = (downloadedBytes / fileSize) * 100;

      // Updates the UI with the current progress
      mainWindow.webContents.send(`vault-download:${resource.id}`, {
        totalLength: fileSize,
        downloaded: downloadedBytes,
        progress: totalProgress,
        speed,
        remainingTime,
        downloading: true,
      });

      // Updates the progress bar
      mainWindow.setProgressBar(downloadedBytes / fileSize);

      lastReportedTime = currentTime;
    }
  };

  findOrCreateFolder(path.dirname(filePath));

  const promises: Promise<void>[] = [];

  // Create the promises for each chunk
  for (let i = 0; i < NUMBER_PARTS; i++) {
    const start = i * chunkSize;
    const end =
      (i + 1) * chunkSize - 1 < fileSize
        ? (i + 1) * chunkSize - 1
        : fileSize - 1;

    promises.push(
      downloadChunk({
        url: resource.url,
        start,
        end,
        index: i,
        progressCallback: updateProgress,
        tempFilePath,
        abortController: controller,
      }),
    );
  }

  await Promise.all(promises);

  const writeStream = fs.createWriteStream(filePath);
  for (let i = 0; i < NUMBER_PARTS; i++) {
    const chunkPath = `${tempFilePath}.part${i}`;
    await readStreamSync(chunkPath, writeStream);
    fs.unlinkSync(chunkPath); // Clean up chunk file after merging
  }

  async function onEnd() {
    new Notification({
      title: 'Download Complete',
      body: resource.name,
    }).show();

    // Reset progress bar
    mainWindow.setProgressBar(-1);

    // Updates the UI with the final progress
    mainWindow.webContents.send(`vault-download:${resource.id}`, {
      totalLength: fileSize,
      progress: 100,
      downloading: false,
    });
  }

  writeStream.end(onEnd);

  const totalTime = (performance.now() - startTime) / 1000;
  console.log(`Total time: ${totalTime.toFixed(2)} seconds`);
}

function readStreamSync(chunkPath: string, writeStream: fs.WriteStream) {
  const stream = fs.createReadStream(chunkPath);

  return new Promise<void>((resolve) => {
    stream.on('data', (data) => {
      writeStream.write(data);
    });
    stream.on('end', () => {
      resolve();
    });
  });
}
