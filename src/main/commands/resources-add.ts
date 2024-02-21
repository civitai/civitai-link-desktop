import { Socket } from 'socket.io-client';
import { downloadFile } from '../download-file';
import { BrowserWindow } from 'electron';
import { getResourcePath } from '../store';

type ResourcesAddParams = {
  id: string;
  payload: Resource;
  socket: Socket;
  mainWindow: BrowserWindow;
};

export async function resourcesAdd(params: ResourcesAddParams) {
  const payload = params.payload;
  const resourcePath = getResourcePath(payload.type);

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
  });

  await downloadFile({
    id: params.id,
    name: payload.name,
    url: payload.url,
    type: payload.type,
    hash: payload.hash,
    modelName: payload.modelName,
    modelVersionName: payload.modelVersionName,
    downloadPath: resourcePath,
    socket: params.socket,
    mainWindow: params.mainWindow,
  });
}
