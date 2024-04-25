import Store, { Schema } from 'electron-store';
import { fetchVaultMeta, fetchVaultModels } from '../civitai-api';
import { getWindow } from '../browser-window';

const schema: Schema<Record<string, unknown>> = {
  vaultMeta: {
    type: 'object',
    default: {
      usedStorageKb: 0,
      storageKb: 0,
    },
  },
  vaultItems: {
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

  store.set('vaultItems', models);
}

export function getVaultMeta() {
  return store.get('vaultMeta');
}

export function getVault() {
  return store.get('vaultItems');
}

export function clearVault() {
  store.clear();
}

export function watchVaultMeta() {
  store.onDidChange('vaultMeta', (newValue) => {
    getWindow().webContents.send('vault-meta-update', newValue);
  });
}

export function watchVault() {
  store.onDidChange('vaultItems', (newValue) => {
    getWindow().webContents.send('vault-update', newValue);
  });
}
