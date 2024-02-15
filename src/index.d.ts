import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      setKey: (key: string) => void;
      selectFolder: () => void;
      setRootResourcePath: (path: string) => void;
      clearSettings: () => void;
      cancelDownload: (id: string) => void;
      closeApp: () => void;
      resourceRemove: (resource: Resource) => void;
    };
  }

  type Resource = {
    hash: string;
    name: string;
    modelName: string;
    modelVersionName: string;
    type: string;
    url: string;
    id?: string;
    downloadDate?: string;
    previewImageUrl?: string;
    civitaiUrl?: string;
  };

  type ResourcesMap = {
    [k: string]: Resource;
  };

  type Activity = {
    [k: string]: {
      totalLength: number;
    } & Resource;
  };

  enum ResourceType {
    MODEL = 'model',
    LORA = 'lora',
    LYCORIS = 'lycoris',
    DEFAULT = 'default',
  }

  type Payload = {
    types: ResourceType;
    resources?: Resource[];
    status: Status;
    progress?: number;
    remainingTime?: number;
    speed?: number;
    error?: string;
  };

  enum Status {
    SUCCESS = 'success',
    PROCESSING = 'processing',
    ERROR = 'error',
    CANCELLED = 'cancelled',
  }

  enum CommandTypes {
    ActivitiesList = 'activities:list',
    ActivitiesCancel = 'activities:cancel',
    ResourcesList = 'resources:list',
    ResourcesAdd = 'resources:add',
    ResourcesRemove = 'resources:remove',
  }
}
