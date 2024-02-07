import { Socket } from 'socket.io-client';
import { downloadFile } from '../download-file';
import { BrowserWindow } from 'electron';
import { getRootResourcePath, getResourcePath } from '../store';

type ResourcesAddParams = { id: string; payload: Resource; socket: Socket; mainWindow: BrowserWindow };

export async function resourcesAdd(params: ResourcesAddParams) {
  const payload = params.payload;
  const rootResourcePath = getRootResourcePath();
  const resourcePath = getResourcePath(payload.type);
  const downloadPath = `${rootResourcePath}/${resourcePath}`;

  params.socket.emit('commandStatus', {
    status: 'processing',
    id: params.id,
    resource: payload,
  });

  params.mainWindow.webContents.send('activity-add', {
    id: params.id,
    downloadDate: new Date().toISOString(),
    ...payload,
  });

  await downloadFile({
    id: params.id,
    name: payload.name,
    url: payload.url,
    type: payload.type,
    hash: payload.hash,
    modelName: payload.modelName,
    modelVersionName: payload.modelVersionName,
    downloadPath,
    socket: params.socket,
    mainWindow: params.mainWindow,
  });
}
