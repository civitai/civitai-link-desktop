import Store, { Schema } from 'electron-store';
import { fetchMember } from '../civitai-api';

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  KICKED = 'kicked',
}

export enum Resources {
  CHECKPOINT = 'Checkpoint',
  CONTROLNET = 'ControlNet',
  UPSCALER = 'Upscaler',
  HYPERNETWORK = 'Hypernetwork',
  TEXTUALINVERSION = 'TextualInversion',
  LORA = 'Lora',
  LOCON = 'LoCon',
  VAE = 'VAE',
  DORA = 'DoRA',
}

const schema: Schema<Record<string, unknown>> = {
  key: {
    type: ['string', 'null'],
    default: null,
  },
  upgradekey: {
    type: ['string', 'null'],
    default: null,
  },
  connectionStatus: {
    type: 'string',
    default: ConnectionStatus.DISCONNECTED,
  },
  // DEPRECATED: Must stick around during migration
  rootResourcePath: {
    type: ['string', 'null'],
    default: null,
  },
  // DEPRECATED: Must stick around during migration
  resourcePaths: {
    type: 'object',
    default: {
      [Resources.CHECKPOINT]: '',
      [Resources.CONTROLNET]: '',
      [Resources.UPSCALER]: '',
      [Resources.HYPERNETWORK]: '',
      [Resources.TEXTUALINVERSION]: '',
      [Resources.LORA]: '',
      [Resources.LOCON]: '',
      [Resources.VAE]: '',
      [Resources.DORA]: '',
    },
  },
  settings: {
    type: 'object',
    default: {
      nsfw: false,
      concurrent: 10,
      alwaysOnTop: false,
    },
  },
  apiKey: {
    type: ['string', 'null'],
    default: null,
  },
  user: {
    type: ['object', 'null'],
    default: null,
  },
};

export const store = new Store({ schema });

export function setKey(key: string | null) {
  store.set('key', key);
}

export function setUpgradeKey(key: string | null) {
  store.set('upgradekey', key);
}

export function setConnectionStatus(status: ConnectionStatus) {
  store.set('connectionStatus', status);
}

export function getKey() {
  return store.get('key');
}

export function getUpgradeKey() {
  return store.get('upgradekey');
}

export function setApiKey(key: string | null) {
  return store.set('apiKey', key);
}

export function watchApiKey({
  mainWindow,
}: {
  mainWindow: Electron.BrowserWindow;
}) {
  store.onDidChange('apiKey', (newValue) => {
    mainWindow.webContents.send('update-api-key', newValue);
  });
}

export function getApiKey() {
  return store.get('apiKey');
}

export function getConnectionStatus() {
  return store.get('connectionStatus');
}

type Settings = {
  nsfw?: boolean;
  alwaysOnTop?: boolean;
  concurrent?: number;
};

export function getSettings() {
  return store.get('settings') as Settings;
}

export function setSettings(settings: Settings) {
  const currentSettings = getSettings();

  return store.set('settings', { ...currentSettings, ...settings });
}

export function clearSettings() {
  // TODO: I dont think this works from the store
  store.set('settings', { nsfw: false, alwaysOnTop: false, concurrent: 10 });
  store.set('apiKey', null);
  store.set('user', null);
  store.set('apiKey', null);
  store.clear();
}

export async function setUser() {
  try {
    const user = await fetchMember();

    return store.set('user', user);
  } catch (e) {
    console.log('Error fetching user', e);
    return;
  }
}

export function getUser() {
  return store.get('user');
}

export function watcherUser({
  mainWindow,
}: {
  mainWindow: Electron.BrowserWindow;
}) {
  store.onDidChange('user', (newValue) => {
    mainWindow.webContents.send('fetch-user', newValue);
  });
}

export function getUIStore() {
  return {
    rootResourcePath: store.get('rootResourcePath'),
    connectionStatus: store.get('connectionStatus'),
    settings: store.get('settings') as Settings,
    apiKey: store.get('apiKey'),
    user: store.get('user'),
  };
}
