import Store, { Schema } from 'electron-store';
import path from 'path';

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
}

// TODO: Make this more app status
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
  rootResourcePath: {
    type: ['string', 'null'],
    default: null,
  },
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
    },
  },
  settings: {
    type: 'object',
    default: {
      nsfw: false,
    },
  },
  apiKey: {
    type: ['string', 'null'],
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

export function getApiKey() {
  return store.get('apiKey');
}

export function getConnectionStatus() {
  return store.get('connectionStatus');
}

type Settings = {
  nsfw: boolean;
};

export function getSettings() {
  return store.get('settings') as Settings;
}

export function setSettings(settings: Settings) {
  return store.set('settings', settings);
}

export function clearSettings() {
  store.clear();
}

export function getUIStore() {
  return {
    rootResourcePath: store.get('rootResourcePath'),
    connectionStatus: store.get('connectionStatus'),
    settings: store.get('settings'),
    apiKey: store.get('apiKey'),
  };
}

// TODO: Pathing move to other store
export function getRootResourcePath(): string {
  return store.get('rootResourcePath') as string;
}

export function setRootResourcePath(path: string) {
  store.set('rootResourcePath', path);
}

export function getResourcePath(resourcePath: string) {
  const resource = Resources[resourcePath.toUpperCase()];
  const resourcePaths = store.get('resourcePaths') as { [k: string]: string };

  if (resourcePaths[resource] === '') {
    const rootResourcePath = getRootResourcePath();

    return path.resolve(
      rootResourcePath,
      Resources[resourcePath.toUpperCase()],
    );
  }

  return resourcePaths[resource];
}

export function setResourcePath(resource: string, path: string) {
  const resourcePaths = store.get('resourcePaths') as { [k: string]: string };

  return store.set('resourcePaths', {
    ...resourcePaths,
    [resource]: path,
  });
}
