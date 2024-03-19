import { Socket } from 'socket.io-client';
import { downloadFile } from '../download-file';
import { BrowserWindow } from 'electron';
import { getResourcePath } from '../store/store';
import { updateActivity } from '../store/activities';
import { getModelByHash } from '../civitai-api';

type ResourcesAddParams = {
  id: string;
  payload: Resource;
  socket: Socket;
  mainWindow: BrowserWindow;
};

export async function resourcesAdd(params: ResourcesAddParams) {
  const payload = params.payload;
  const hashLowercase = payload.hash.toLowerCase();
  const resourcePath = getResourcePath(payload.type);
  const { previewImageUrl, civitaiUrl, modelVesrionId } =
    await getModelByHash(hashLowercase);
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
    previewImageUrl,
    civitaiUrl,
    downloading: true,
    modelVesrionId,
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
      type: payload.type,
      hash: hashLowercase,
      modelName: payload.modelName,
      modelVersionName: payload.modelVersionName,
      modelVesrionId,
      previewImageUrl,
      civitaiUrl,
    },
    downloadPath: resourcePath,
    socket: params.socket,
    mainWindow: params.mainWindow,
  });
}
