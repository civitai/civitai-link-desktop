import Store, { Schema } from 'electron-store';
import { fetchVaultMeta } from '../civitai-api';

const schema: Schema<Record<string, unknown>> = {
  vaultMeta: {
    type: 'object',
    default: {
      usedStorageKb: 0,
      storageKb: 0,
    },
  },
  vault: {
    type: 'object',
    default: {},
  },
};

export const store = new Store({ schema });

// Maybe add a refresh check
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

export function setVault() {
  store.set('vault', {});
}

export function getVaultMeta() {
  return store.get('vaultMeta');
}

export function getVault() {
  return store.get('vault');
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
  store.onDidChange('vault', (newValue) => {
    mainWindow.webContents.send('vault-update', newValue);
  });
}
