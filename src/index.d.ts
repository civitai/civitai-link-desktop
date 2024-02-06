import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      setKey: (key: string) => void;
      selectFolder: () => void;
      setDirectory: (type: string, path: string) => void;
      clearSettings: () => void;
    };
  }
}

enum Resource {
  MODEL = 'model',
  LORA = 'lora',
  LYCORIS = 'lycoris',
  DEFAULT = 'default',
}
