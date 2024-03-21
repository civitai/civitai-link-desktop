import Store, { Schema } from 'electron-store';
import { fetchVaultMeta, fetchVaultModels } from '../civitai-api';

const schema: Schema<Record<string, unknown>> = {
  vaultMeta: {
    type: 'object',
    default: {
      usedStorageKb: 0,
      storageKb: 0,
    },
  },
  vaulItems: {
    type: 'array',
    default: [],
  },
};

export const store = new Store({ schema });

export async function setVaultMeta() {
  const meta = await fetchVaultMeta();

  store.set(
    'vaultMeta',
    meta?.vault || {
      usedStorageKb: 0,
      storageKb: 0,
    },
  );
}

export async function setVault() {
  const models = await fetchVaultModels();

  store.set('vaulItems', models);
}

export function getVaultMeta() {
  return store.get('vaultMeta');
}

export function getVault() {
  return store.get('vaulItems');
}

export function clearVault() {
  store.clear();
}

type watcherVaultParams = {
  mainWindow: Electron.BrowserWindow;
};

export function watchVaultMeta({ mainWindow }: watcherVaultParams) {
  store.onDidChange('vaultMeta', (newValue) => {
    mainWindow.webContents.send('vault-meta-update', newValue);
  });
}

export function watchVault({ mainWindow }: watcherVaultParams) {
  store.onDidChange('vaulItems', (newValue) => {
    mainWindow.webContents.send('vault-update', newValue);
  });
}
