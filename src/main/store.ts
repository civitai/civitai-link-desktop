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

const schema = {
  key: {
    type: 'string',
    default: null,
  },
  upgradekey: {
    type: 'string',
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
        type: 'string',
        default: null,
      },
      lora: {
        type: 'string',
        default: null,
      },
      lycoris: {
        type: 'string',
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
const store = new Store({ schema });

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

export function getDirectories() {
  return store.get('modelDirectories');
}

export function getUIStore() {
  return {
    // upgradekey: store.get('upgradekey'),
    modelDirectories: store.get('modelDirectories'),
  };
}
