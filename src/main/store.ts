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
  // TODO: Change to rootResourcePath
  modelDirectories: {
    type: 'object',
    default: {
      model: {
        type: ['string', 'null'],
        default: null,
      },
    },
  },
  rootResourcePath: {
    type: ['string', 'null'],
    default: null,
  },
  // TODO: Set this at start w/ default values using model route
  resourcePaths: {
    type: 'object',
    default: {
      [Resources.CHECKPOINT]: '',
      [Resources.CONTROLNET]: '',
      [Resources.UPSCALER]: '',
      [Resources.HYPERNETWORK]: '',
      [Resources.TEXTUAL_INVERSION]: '',
      [Resources.LORA]: '',
      [Resources.LO_CON]: '',
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
