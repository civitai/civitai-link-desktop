import { Socket } from 'socket.io-client';
import { downloadFile } from '../download-file';
import { BrowserWindow } from 'electron';
import { getResourcePath } from '../store';
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
  const { previewImageUrl, civitaiUrl } = await getModelByHash(hashLowercase);

  params.socket.emit('commandStatus', {
    status: 'processing',
    id: params.id,
    resource: payload,
    type: 'resources:add',
  });

  params.mainWindow.webContents.send('activity-add', {
    id: params.id,
    downloadDate: new Date().toISOString(),
    ...payload,
    previewImageUrl,
    civitaiUrl,
  });

  await downloadFile({
    id: params.id,
    name: payload.name,
    url: payload.url,
    type: payload.type,
    hash: hashLowercase,
    modelName: payload.modelName,
    modelVersionName: payload.modelVersionName,
    downloadPath: resourcePath,
    socket: params.socket,
    mainWindow: params.mainWindow,
    previewImageUrl,
    civitaiUrl,
  });
}
