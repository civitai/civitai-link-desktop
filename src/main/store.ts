import Store from 'electron-store';

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  KICKED = 'kicked',
}

// TODO: move to *.d.ts
// These are the paths for default
export enum Resources {
  CHECKPOINT = 'Checkpoint',
  CONTROLNET = 'ControlNet',
  UPSCALER = 'Upscaler',
  HYPERNETWORK = 'Hypernetwork',
  TEXTUAL_INVERSION = 'TextualInversion',
  LORA = 'Lora',
  LO_CON = 'LoCon',
  VAE = 'VAE',
}

type Directories = { model: string | null; lora: string | null; lycoris: string | null };

const schema = {
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
      [Resources.CHECKPOINT]: 'Checkpoint',
      [Resources.CONTROLNET]: 'ControlNet',
      [Resources.UPSCALER]: 'ESRGAN',
      [Resources.HYPERNETWORK]: 'hypernetworks',
      [Resources.TEXTUAL_INVERSION]: 'TextualInversion',
      [Resources.LORA]: 'Lora',
      [Resources.LO_CON]: 'LyCORIS',
      [Resources.VAE]: 'VAE',
    },
  },
  // More historical
  activityList: {
    type: 'array',
    default: [],
  },
  // All of the resources available
  resources: {
    type: 'object',
    default: {},
  },
};

// @ts-ignore
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

export function getConnectionStatus() {
  return store.get('connectionStatus');
}

export function setDirectory(type: 'model' | 'lora' | 'lycoris', path: string) {
  store.set(`modelDirectories.${type}`, path);
}

export function clearSettings() {
  store.clear();
}

export function getDirectories(): Directories {
  return store.get('modelDirectories') as Directories;
}

export function getRootResourcePath() {
  return store.get('rootResourcePath');
}

export function setRootResourcePath(path: string) {
  store.set('rootResourcePath', path);
}

export function getUIStore() {
  return {
    // upgradekey: store.get('upgradekey'),
    modelDirectories: store.get('modelDirectories'),
    activityList: store.get('activityList'),
  };
}

export function getResourcePath(path: string) {
  const resource = Resources[path];
  const resourcePaths = store.get('resourcePaths') as { [k: string]: string };

  return resourcePaths[resource];
}

export function addActivity(activity: Activity) {
  const activities = store.get('activityList') as Activity[];
  activities.push(activity);

  store.set('activityList', activities);
}

export function lookupResource(hash: string) {
  // Change this to key/map of Resources
  const resources = store.get('resources') as Activity;

  return resources[hash];
}
