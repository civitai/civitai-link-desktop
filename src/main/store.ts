import Store from 'electron-store';

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  KICKED = 'kicked',
}

export enum Resources {
  CHECKPOINT = 'Checkpoint',
  CHECKPOINT_CONFIG = 'CheckpointConfig',
  CONTROLNET = 'Controlnet',
  UPSCALER = 'Upscaler',
  HYPERNETWORK = 'Hypernetwork',
  TEXTUAL_INVERSION = 'TextualInversion',
  LORA = 'LORA',
  LO_CON = 'LoCon',
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
  modelDirectories: {
    type: 'object',
    default: {
      model: {
        type: ['string', 'null'],
        default: null,
      },
      lora: {
        type: ['string', 'null'],
        default: null,
      },
      lycoris: {
        type: ['string', 'null'],
        default: null,
      },
    },
  },
  resourcePaths: {
    type: 'object',
    default: {
      [Resources.CHECKPOINT]: '',
      [Resources.CHECKPOINT_CONFIG]: '',
      [Resources.CONTROLNET]: '',
      [Resources.UPSCALER]: '',
      [Resources.HYPERNETWORK]: '',
      [Resources.TEXTUAL_INVERSION]: '',
      [Resources.LORA]: '',
      [Resources.LO_CON]: '',
    },
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

export function getUIStore() {
  return {
    // upgradekey: store.get('upgradekey'),
    modelDirectories: store.get('modelDirectories'),
  };
}
