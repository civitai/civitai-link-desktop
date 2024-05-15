import Store, { Schema } from 'electron-store';
import { fetchVaultMeta, fetchVaultModels as fetchAllVaultItems } from '../civitai-api';
import { getWindow } from '../browser-window';
import { getApiKey } from './store';
import { getFiles, updateFile } from './files';

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
  const apiKey = getApiKey();
  if (!apiKey) return;

  const vaultItems = await fetchAllVaultItems();
  const vaultItemsByModelVersionId = Object.fromEntries(vaultItems.map((x) => [x.modelVersionId, x]));
  const files = getFiles();

  for (const file of Object.values(files)) {
    if (!file.modelVersionId) continue;
    const vaultItem = vaultItemsByModelVersionId[file.modelVersionId];
    if (!vaultItem && !file.vaultId) continue;

    updateFile({
      ...file,
      vaultId: vaultItem?.id,
    });
  }
  store.set('vaultItems', vaultItems);
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
