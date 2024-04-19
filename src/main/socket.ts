import { io } from 'socket.io-client';
import {
  ConnectionStatus,
  getUpgradeKey,
  setConnectionStatus,
  setKey,
  setUpgradeKey,
} from './store/store';
import { searchFile } from './store/files';
import {
  activitiesCancel,
  activitiesClear,
  activitiesList,
  imageTxt2img,
  resourcesAdd,
  resourcesRemove,
} from './commands';
import { BrowserWindow } from 'electron';
import { filterResourcesList } from './commands/filter-reources-list';

export const socket = io(import.meta.env.MAIN_VITE_SOCKET_URL, {
  path: '/api/socketio',
  autoConnect: false,
});

export function socketCommandStatus(payload) {
  socket.emit('commandStatus', {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

type socketEmitParams = {
  eventName: string;
  payload: any;
  cb?: () => void;
};

export function socketEmit({ eventName, payload, cb }: socketEmitParams) {
  console.log('socketEmit', eventName);
  socket.emit(eventName, payload, cb);
}

export function leaveSocketRoom() {
  socket.emit('leave');
}

type socketIOConnectParams = {
  mainWindow: BrowserWindow;
  app: Electron.App;
};

export function socketIOConnect({ mainWindow, app }: socketIOConnectParams) {
  socket.connect();
  console.log('Socket connecting...');
  setConnectionStatus(ConnectionStatus.CONNECTING);

  // Socket Event handlers
  socket.on('connect', () => {
    console.log('Connected to Civitai Link Server');
    socket.emit('iam', { type: 'sd' });
    setConnectionStatus(ConnectionStatus.CONNECTING);

    const upgradeKey = getUpgradeKey();

    // Join room if upgrade upgradeKey exists
    if (upgradeKey) {
      console.log('Using upgrade key');

      socket.emit('join', upgradeKey, () => {
        setConnectionStatus(ConnectionStatus.CONNECTED);
        console.log(`Joined room ${upgradeKey}`);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Civitai Link Server');
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
  });

  socket.on('error', (err) => {
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    console.error(err);
  });

  socket.on('command', (payload) => {
    console.log('command', payload);

    switch (payload['type']) {
      case 'activities:list':
        activitiesList();
        break;
      case 'activities:clear':
        activitiesClear();
        break;
      case 'activities:cancel':
        activitiesCancel({ mainWindow, activityId: payload.activityId });
        break;
      case 'resources:list':
        const resourceList = filterResourcesList();
        socketCommandStatus({
          id: payload.id,
          type: payload.type,
          status: 'success',
          resources: resourceList,
        });
        break;
      case 'resources:add':
        if (searchFile(payload.resource.hash)) {
          mainWindow.webContents.send('error', 'Resource already exists');
        } else {
          resourcesAdd({
            id: payload.id,
            payload: payload.resource,
            socket,
            mainWindow,
          });
        }
        break;
      case 'resources:remove':
        const updatedResources = resourcesRemove(payload.resource.hash);
        socketCommandStatus({
          id: payload.id,
          type: 'resources:remove',
          status: 'success',
          resource: payload.resource,
        });
        socketCommandStatus({
          type: 'resources:list',
          resources: updatedResources,
        });
        mainWindow.webContents.send('resource-remove', {
          resource: payload.resource,
        });
        break;
      case 'image:txt2img':
        imageTxt2img();
        break;
      default:
        console.log(`Unknown command: ${payload['command']}`);
    }
  });

  socket.on('kicked', () => {
    console.log('Kicked from instance. Clearing key.');
    setKey(null);
    setUpgradeKey(null);
    setConnectionStatus(ConnectionStatus.CONNECTING);
  });

  socket.on('roomPresence', (payload) => {
    console.log(
      `Presence update: SD: ${payload['sd']}, Clients: ${payload['client']}`,
    );

    if (payload['client'] === 0 || payload['sd'] === 0) {
      setConnectionStatus(ConnectionStatus.CONNECTING);
    } else {
      setConnectionStatus(ConnectionStatus.CONNECTED);
    }
  });

  socket.on('upgradeKey', (payload) => {
    console.log(`Received upgrade key: ${payload['key']}`);
    setUpgradeKey(payload['key']);
    mainWindow.webContents.send('upgrade-key', { key: payload['key'] });

    socket.emit('join', payload['key'], () => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      console.log(`Re-joined room with upgrade key: ${payload['key']}`);
    });
  });

  socket.on('join', () => {
    setConnectionStatus(ConnectionStatus.CONNECTED);
    console.log('Joined room');
  });

  app.on('before-quit', () => {
    socket.close();
  });
}
