import { Socket } from 'socket.io-client';
import { downloadFile } from '../download-file';
import { BrowserWindow } from 'electron';
import { getResourcePath } from '../store/paths';
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
  const data = await getModelByHash(hashLowercase);
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
    downloading: true,
    ...payload,
    ...data,
  });

  const activity: ActivityItem = {
    name: payload.modelName,
    date: timestamp,
    type: 'downloading' as ActivityType,
    civitaiUrl: data.civitaiUrl,
  };

  updateActivity(activity);

  await downloadFile({
    resource: {
      id: params.id,
      ...payload,
      ...data,
    },
    downloadPath: resourcePath,
    socket: params.socket,
    mainWindow: params.mainWindow,
  });
}
