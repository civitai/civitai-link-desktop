import chokidar from 'chokidar';
import os from 'os';
import path from 'path';
import workerpool from 'workerpool';
import { getWindow } from './browser-window';
import { getModelByHash } from './civitai-api';
import { listDirectories } from './list-directory';
import { socketCommandStatus } from './socket';
import { addFile, deleteFile, findFileByFilename } from './store/files';
import { addNotFoundFile, searchNotFoundFile } from './store/not-found';
import { getAllPaths, getRootResourcePath, store } from './store/paths';
import { diffDirectories } from './store/startup-files';
import { setVault } from './store/vault';
import { checkMissingFields } from './utils/check-missing-fields';
import { limitConcurrency } from './utils/concurrency-helpers';
import { fileStats } from './utils/file-stats';

const maxWorkers = os.cpus().length > 1 ? os.cpus().length - 1 : 1;
const pool = workerpool.pool(__dirname + '/worker.js', { maxWorkers });
const FILE_TYPES = ['.pt', '.pth', '.safetensors', '.ckpt', '.bin', '.onnx'];

const FOLDER_TYPE_MAP: Record<string, string> = {
  checkpoints: 'CHECKPOINT',
  'stable-diffusion': 'CHECKPOINT',
  loras: 'LORA',
  lora: 'LORA',
  locon: 'LOCON',
  lycorys: 'LOCON',
  vae: 'VAE',
  controlnet: 'CONTROLNET',
  embeddings: 'TEXTUALINVERSION',
  hypernetworks: 'HYPERNETWORK',
  hypernetwork: 'HYPERNETWORK',
  upscale_models: 'UPSCALER',
  upscaler: 'UPSCALER',
  esrgan: 'UPSCALER',
  realesrgan: 'UPSCALER',
  swinir: 'UPSCALER',
  gfpgan: 'FACERESTORE',
  unet: 'UNET',
  clip: 'CLIP',
  clip_vision: 'CLIP_VISION',
  gligen: 'GLIGEN',
  style_models: 'STYLE_MODEL',
  ipadapter: 'IPADAPTER',
  'ipadapter-flux': 'IPADAPTER',
  textencoder: 'TEXT_ENCODER',
  text_encoders: 'TEXT_ENCODER',
  t5: 'TEXT_ENCODER',
  diffusion_models: 'DIFFUSION_MODEL',
  animatediff_models: 'ANIMATEDIFF',
  animatediff_motion_lora: 'MOTION_LORA',
  adapter: 'ADAPTER',
  insightface: 'INSIGHTFACE',
  facerestore_models: 'FACERESTORE',
  sams: 'SAM',
  sam2: 'SAM',
  sam3: 'SAM',
  ultralytics: 'ULTRALYTICS',
  yolo: 'ULTRALYTICS',
  yolov8: 'ULTRALYTICS',
  depth: 'DEPTH',
  depthanything: 'DEPTH',
  depthfm: 'DEPTH',
  pulid: 'PULID',
  photomaker: 'PHOTOMAKER',
  llm: 'LLM',
  blip: 'LLM',
  florence2: 'LLM',
  dora: 'DORA',
};

function detectTypeFromPath(filePath: string): string {
  const normalizedPath = filePath.toLowerCase().replace(/\\/g, '/');
  const parts = normalizedPath.split('/');

  // Check each folder in the path from deepest to shallowest
  for (let i = parts.length - 2; i >= 0; i--) {
    const folder = parts[i];
    if (FOLDER_TYPE_MAP[folder]) {
      return FOLDER_TYPE_MAP[folder];
    }
  }

  return 'Unknown';
}

const watchConfig = {
  ignoreInitial: true,
};

let watcher: chokidar.FSWatcher | undefined;

export function folderWatcher() {
  const rootResourcePath = getRootResourcePath();

  // Makes sure a root path is set
  if (rootResourcePath && rootResourcePath !== '') {
    const resourcePaths = getAllPaths();
    watcher = createWatcher(resourcePaths);
  }

  // This is in case the directory changes
  // We want to stop watching the current directory and start watching the new one
  const handlePathUpdate = async () => {
    // Fetch the updated paths
    const updatedResourcePaths = getAllPaths();

    if (updatedResourcePaths) {
      if (watcher) await watcher.close();
      watcher = createWatcher(updatedResourcePaths);
    }
  };
  store.onDidChange('resourcePaths', handlePathUpdate);
  store.onDidChange('rootResourcePath', handlePathUpdate);
}

function createWatcher(paths: string | string[]) {
  return chokidar
    .watch(paths, watchConfig)
    .on('add', (path) => process(path, 'add'))
    .on('unlink', (path) => process(path, 'unlink'));
}

const UNLINK_DELAY = 1000;
const processing: Record<
  string,
  { event: 'add' | 'unlink'; timeout?: NodeJS.Timeout }
> = {};

function process(filepath: string, event: 'add' | 'unlink') {
  const key = path.basename(filepath);

  if (event === 'add') {
    if (processing[key]?.event === 'unlink')
      clearTimeout(processing[key].timeout);
    const timeout = setTimeout(() => delete processing[key], UNLINK_DELAY);
    processing[key] = { event, timeout };
    onAdd(filepath);
  } else if (event === 'unlink') {
    if (processing[key]?.event === 'add') return;
    const timeout = setTimeout(() => onUnlink(filepath), UNLINK_DELAY);
    processing[key] = { event, timeout };
  }
}

function onUnlink(filePath: string) {
  // Short circuit if file isnt a model file
  const lowerPath = filePath.toLowerCase();
  if (!FILE_TYPES.some((ext) => lowerPath.endsWith(ext))) return;

  // Remove file from store
  const resource = findFileByFilename(path.basename(filePath));

  if (!resource) {
    return;
  }

  deleteFile(resource.hash);
  const updatedResources = getAllPaths();

  socketCommandStatus({
    type: 'resources:list',
    resources: updatedResources,
  });

  getWindow().webContents.send('resource-remove', {
    resource,
  });
}

async function onAdd(pathname: string) {
  // Short circuit if file isnt a model file
  const lowerPath = pathname.toLowerCase();
  if (!FILE_TYPES.some((ext) => lowerPath.endsWith(ext))) {
    return;
  }

  console.log(`onAdd: Processing ${pathname}`);

  // Short circuit if in not found store
  const notFoundFile = searchNotFoundFile(pathname);
  if (notFoundFile) {
    console.log(`onAdd: Skipping ${pathname} - already in not-found store`);
    return;
  }

  // See if file already exists by filename
  const resource = findFileByFilename(pathname);

  // Update file path and any missing fields
  if (resource) {
    console.log(
      `onAdd: File already exists, checking missing fields: ${pathname}`,
    );
    await checkMissingFields(resource, pathname);
  } else {
    console.log(`onAdd: New file, hashing: ${pathname}`);
    await hashFile(pathname);
  }
}

const toHash: Record<
  string,
  { fileSize: number; status: 'pending' | 'complete' }
> = {};

async function hashFile(pathname: string) {
  if (toHash[pathname]) {
    console.log(`hashFile: Already processing ${pathname}`);
    return;
  }
  const stats = await fileStats(pathname);
  if (!stats?.fileSize) {
    console.log(`hashFile: Could not get file stats for ${pathname}`);
    return;
  }
  toHash[pathname] = { fileSize: stats.fileSize, status: 'pending' };
  updateLoader();

  try {
    console.log(`hashFile: Hashing ${pathname}...`);
    const { modelHash, metadata } = await pool.exec('processTask', [pathname]);
    console.log(`hashFile: Got hash ${modelHash} for ${pathname}`);

    try {
      const model = await getModelByHash(modelHash);
      console.log(
        `hashFile: Found on Civitai - type: ${model.type}, baseModel: ${model.baseModel}`,
      );
      await addFile({ ...model, localPath: pathname, metadata });
    } catch (err) {
      console.warn(
        `hashFile: Model not found on Civitai, adding as local file: ${pathname}`,
      );
      // Fallback: Add as unknown/local file, detect type from folder path
      const filename = path.basename(pathname);
      const detectedType = detectTypeFromPath(pathname);
      console.log(`hashFile: Detected type from path: ${detectedType}`);
      const fallbackResource: Resource = {
        hash: modelHash,
        name: filename,
        modelName: filename.replace(path.extname(filename), ''),
        type: detectedType,
        localPath: pathname,
        metadata,
        modelVersionName: '',
        url: '',
      };

      await addFile(fallbackResource);
      addNotFoundFile(pathname, modelHash);
    } finally {
      toHash[pathname].status = 'complete';
      updateLoader();
      setTimeout(() => {
        delete toHash[pathname];
        updateLoader();
      }, 30000);
    }
  } catch (err) {
    console.error(`hashFile: Error hashing ${pathname}:`, err);
  }
}

function updateLoader() {
  const toScan = Object.values(toHash).reduce((a, b) => a + b.fileSize, 0);
  const scanned = Object.values(toHash)
    .filter((v) => v.status === 'complete')
    .reduce((a, b) => a + b.fileSize, 0);
  const remaining = toScan - scanned;
  getWindow().webContents.send('model-loading', {
    toScan,
    scanned,
    isScanning: remaining > 0,
  });
}

export async function initFolderCheck() {
  // Init load is empty []
  const files = listDirectories();

  // Remove files that are no longer in the directories from our records
  const filesToRemoveFromStore = diffDirectories(
    files.map((file) => file.pathname),
  );
  filesToRemoveFromStore.forEach((pathname) => {
    const file = findFileByFilename(path.basename(pathname));

    if (file) {
      // Remove file from store
      deleteFile(file.hash);
    }
  });

  // Start background processing without blocking startup
  console.log(`Starting background processing for ${files.length} found files`);
  processFilesInBackground(files);
  await setVault();
}

async function processFilesInBackground(files: { pathname: string }[]) {
  console.log('Classifying files by size...');
  const LARGE_FILE_THRESHOLD = 1024 * 1024 * 1024; // 1GB
  const smallFiles: string[] = [];
  const largeFiles: string[] = [];

  // Categorize files by size
  for (const { pathname } of files) {
    try {
      const stats = await fileStats(pathname);
      if (stats.fileSize && stats.fileSize > LARGE_FILE_THRESHOLD) {
        largeFiles.push(pathname);
      } else {
        smallFiles.push(pathname);
      }
    } catch (error) {
      // If we can't get stats, treat as small file
      smallFiles.push(pathname);
    }
  }

  // Send initial model-loading event to indicate scanning is starting
  if (smallFiles.length > 0 || largeFiles.length > 0) {
    getWindow().webContents.send('model-loading', {
      toScan: 0,
      scanned: 0,
      isScanning: true,
    });
  }

  try {
    // Process small files first with full concurrency
    if (smallFiles.length > 0) {
      const smallFilePromises = smallFiles.map((pathname) => async () => {
        await onAdd(pathname);
      });
      await limitConcurrency(smallFilePromises, pool.maxWorkers || maxWorkers);
    }

    // Process large files with reduced concurrency to avoid overwhelming system
    if (largeFiles.length > 0) {
      const largeFilePromises = largeFiles.map((pathname) => async () => {
        await onAdd(pathname);
      });
      const reducedConcurrency = Math.max(
        1,
        Math.floor((pool.maxWorkers || maxWorkers) / 2),
      );
      await limitConcurrency(largeFilePromises, reducedConcurrency);
    }
  } catch (error) {
    console.error('Error during background file processing:', error);
  }
}

export async function cleanupWatcher() {
  try {
    if (watcher) {
      await watcher.close();
      watcher = undefined;
    }
    await pool.terminate();
  } catch (error) {
    console.error('Error during watcher cleanup:', error);
  }
}
