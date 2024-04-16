import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  setKey: (key: string) => ipcRenderer.send('set-key', key),
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  setRootResourcePath: (path: string) =>
    ipcRenderer.send('set-root-path', {
      path,
    }),
  clearSettings: () => ipcRenderer.send('clear-settings'),
  cancelDownload: (id: string) => ipcRenderer.send('cancel-download', id),
  closeApp: () => ipcRenderer.send('close-app'),
  resourceRemove: (resource: Resource) =>
    ipcRenderer.send('resource-remove', resource),
  setResourcePath: (type: ResourceType, path: string) =>
    ipcRenderer.send('set-path', {
      type,
      path,
    }),
  getResourcePath: (type: ResourceType) =>
    ipcRenderer.invoke('get-resource-path', type),
  openRootModelFolder: () => ipcRenderer.send('open-root-model-folder'),
  init: () => ipcRenderer.send('init'),
  setNSFW: (nsfw: boolean) => ipcRenderer.send('set-nsfw', nsfw),
  openModelFileFolder: (filePath: string) =>
    ipcRenderer.send('open-model-file-folder', filePath),
  setApiKey: (key: string) => ipcRenderer.send('set-api-key', key),
  fetchVaultMeta: () => ipcRenderer.send('fetch-vault-meta'),
  toggleVaultItem: ({
    hash,
    modelVersionId,
  }: {
    hash?: string;
    modelVersionId: number;
  }) => ipcRenderer.send('toggle-vault-item', { hash, modelVersionId }),
  fetchVaultModels: () => ipcRenderer.send('fetch-vault-models'),
  setStableDiffusion: (type: string) =>
    ipcRenderer.send('set-stable-diffusion', type),
  searchFile: (hash: string) => ipcRenderer.send('search-file', hash),
  restartApp: () => ipcRenderer.send('restart-app'),
  fetchMetadata: (localPath: string) =>
    ipcRenderer.invoke('fetch-metadata', localPath),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
