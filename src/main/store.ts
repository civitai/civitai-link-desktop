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
  resources: {
    type: 'object',
    default: {},
  },
  activitiesList: {
    type: 'array',
    default: [],
  },
  settings: {
    type: 'object',
    default: {
      nsfw: false,
    },
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

export function getConnectionStatus() {
  return store.get('connectionStatus');
}

export function clearSettings() {
  store.clear();
}

export function getRootResourcePath(): string {
  return store.get('rootResourcePath') as string;
}

export function setRootResourcePath(path: string) {
  store.set('rootResourcePath', path);
}

export function getUIStore() {
  return {
    rootResourcePath: store.get('rootResourcePath'),
    activities: store.get('activitiesList'),
    files: store.get('resources'),
    connectionStatus: store.get('connectionStatus'),
    settings: store.get('settings'),
  };
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

export function updateActivity(activity: ActivityItem) {
  const activities = store.get('activitiesList') as ActivityItem[];

  // Only keep last 30 activities
  if (activities.length > 30) {
    const clonedActivities = [...activities];
    clonedActivities.pop();

    return store.set('activitiesList', [activity, ...clonedActivities]);
  } else {
    return store.set('activitiesList', [activity, ...activities]);
  }
}

export function addResource(resource: Resource) {
  const resources = store.get('resources') as ResourcesMap;
  const resourceToAdd = { ...resource, hash: resource.hash.toLowerCase() };

  return store.set('resources', {
    [resourceToAdd.hash]: resourceToAdd,
    ...resources,
  });
}

export function removeResource(hash: string) {
  const resources = store.get('resources') as ResourcesMap;

  delete resources[hash.toLowerCase()];

  return store.set('resources', resources);
}

export function lookupResource(hash: string) {
  const resources = store.get('resources') as ResourcesMap;

  return resources[hash.toLowerCase()];
}

export function updatedResource(resource: Resource) {
  const resources = store.get('resources') as ResourcesMap;

  return store.set('resources', {
    ...resources,
    [resource.hash]: resource,
  });
}

export function getResources() {
  return store.get('resources') as ResourcesMap;
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
