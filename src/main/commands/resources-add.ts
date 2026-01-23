import { Socket } from 'socket.io-client';
import { getSmartPath } from '../utils/smart-path';
// import { downloadFile } from '../download-file';
import { BrowserWindow } from 'electron';
import { getModelByHash } from '../civitai-api';
import { downloadFile } from '../download-file';
import { updateActivity } from '../store/activities';


type ResourcesAddParams = {
  id: string;
  payload: Resource;
  socket: Socket;
  mainWindow: BrowserWindow;
};

export async function resourcesAdd(params: ResourcesAddParams) {
  const payload = params.payload;
  const hashLowercase = payload.hash.toLowerCase();
  // Destructure tags from the fetched model data
  const {
    previewImageUrl,
    civitaiUrl,
    modelVersionId,
    baseModel,
    trainedWords,
    tags,
  } = await getModelByHash(hashLowercase);
  
  // Smart Categorization Logic
  // Smart Categorization Logic
  const { path: targetPath, smartType } = getSmartPath({
    type: payload.type,
    baseModel,
    tags,
  });

  const timestamp = new Date().toISOString();

  params.socket.emit('commandStatus', {
    status: 'processing',
    id: params.id,
    resource: payload,
    type: 'resources:add',
  });

  params.mainWindow.webContents.send('activity-add', {
    id: params.id,
    downloadDate: timestamp,
    ...payload,
    hash: hashLowercase,
    previewImageUrl,
    civitaiUrl,
    downloading: true,
    modelVersionId,
  });

  const activity: ActivityItem = {
    name: payload.modelName,
    date: timestamp,
    type: 'downloading' as ActivityType,
    civitaiUrl,
  };

  updateActivity(activity);

  await downloadFile({
    resource: {
      id: params.id,
      name: payload.name,
      url: payload.url,
      type: smartType, // Use refined type
      hash: hashLowercase,
      modelName: payload.modelName,
      modelVersionName: payload.modelVersionName,
      modelVersionId,
      previewImageUrl,
      civitaiUrl,
      baseModel,
      trainedWords,
      tags,
    },
    downloadPath: targetPath, // Use refined path
    socket: params.socket,
    mainWindow: params.mainWindow,
  });
}
