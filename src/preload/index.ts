import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  setKey: (key: string) => ipcRenderer.send('set-key', key),
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  setDirectory: (type: string, path: string) =>
    ipcRenderer.send('set-directory', {
      type,
      path,
    }),
  clearSettings: () => ipcRenderer.send('clear-settings'),
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
