import Store from 'electron-store';

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
  TEXTUAL_INVERSION = 'TextualInversion',
  LORA = 'Lora',
  LO_CON = 'LoCon',
  VAE = 'VAE',
}

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
  // All of the resources available
  // Only used for lookup purposes
  resources: {
    type: 'object',
    default: {},
  },
  // More historical activities < 30
  activities: {
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
    activities: store.get('activities'),
  };
}

export function getResourcePath(path: string) {
  const resource = Resources[path];
  const resourcePaths = store.get('resourcePaths') as { [k: string]: string };

  return resourcePaths[resource];
}

// TODO: Activities should be based on the action type 'resources:add' etc.
export function addActivity(activity: Resource) {
  const activities = store.get('activities') as ResourcesMap;
  const activityToAdd = { ...activity, hash: activity.hash.toLowerCase() };

  // Only keep last 30 activities
  if (Object.keys(activities).length > 30) {
    const [_, ...rest] = Object.entries(activities);

    return store.set('activities', { [activityToAdd.hash]: activityToAdd, ...Object.fromEntries(rest) });
  } else {
    return store.set('activities', { [activityToAdd.hash]: activityToAdd, ...activities });
  }
}

export function addResource(resource: Resource) {
  const resources = store.get('resources') as ResourcesMap;
  const resourceToAdd = { ...resource, hash: resource.hash.toLowerCase() };

  return store.set('resources', { [resourceToAdd.hash]: resourceToAdd, ...resources });
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

export function getResources() {
  return store.get('resources') as ResourcesMap;
}
