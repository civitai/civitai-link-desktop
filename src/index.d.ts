import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      setKey: (key: string) => void;
      selectFolder: (dirPath: string) => void;
      setRootResourcePath: (path: string) => void;
      clearSettings: () => void;
      cancelDownload: (id: string) => void;
      closeApp: () => void;
      resourceRemove: (resource: Resource) => void;
      setResourcePath: (type: keyof typeof ResourceType, path: string) => void;
      getResourcePath: (type: keyof typeof ResourceType) => string;
      openRootModelFolder: () => void;
      init: () => void;
      setNSFW: (nsfw: boolean) => void;
      setConcurrent: (concurrent: number) => void;
      openModelFileFolder: (filePath: string) => void;
      setApiKey(key: string): void;
      fetchVaultMeta: () => void;
      fetchVaultModels: () => void;
      toggleVaultItem: ({
        hash,
        modelVersionId,
      }: {
        hash?: string;
        modelVersionId: number;
      }) => Promise<number | undefined>;
      setStableDiffusion: (type: string) => void;
      searchFile: (hash: string) => Resource;
      restartApp: () => void;
      fetchMetadata: (localPath: string, hash: string) => JSON;
      getRootPath: () => string;
      setAlwaysOnTop: (alwaysOnTop: boolean) => void;
      fetchFileNotes: (hash: string) => string;
      saveFileNotes: (hash: string, notes: string) => void;
      downloadVaultItem: (resource: {
        url: string;
        name: string;
        id: number;
        type: string;
      }) => void;
      cancelVaultDownload: (id: number) => void;
      getFileByHash: (hash: string) => Resource;
    };
  }

  type Resource = {
    hash: string;
    name: string; // filename
    modelName: string;
    modelVersionName: string;
    type: string;
    url: string; // download url
    id?: string;
    modelVersionId?: number;
    downloadDate?: string;
    previewImageUrl?: string;
    civitaiUrl?: string;
    downloading?: boolean;
    localPath?: string;
    vaultId?: number;
    trainedWords?: string[];
    description?: string;
    baseModel?: string;
    fileSize?: number; // bytes
    notes?: string;
    metadata?: Record<string, any> | string;
  };

  type VaultItem = {
    id: number;
    status: 'Pending' | 'Stored';
    modelName: string;
    versionName: string;
    type: string;
    modelId: number;
    modelVersionId: number;
    coverImageUrl: string;
    files: { url: string }[];
    baseModel: string;
    modelSizeKb: number;
    addedAt: string;
  };

  enum ActivityType {
    Downloaded = 'downloaded',
    Deleted = 'deleted',
    Cancelled = 'cancelled',
    Downloading = 'downloading',
    ADDED_VAULT = 'added vault',
    REMOVED_VAULT = 'removed vault',
  }

  type ActivityItem = {
    name: string;
    date: string;
    type: ActivityType;
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
    DEFAULT = 'default',
    CHECKPOINT = 'Checkpoint',
    CONTROLNET = 'ControlNet',
    UPSCALER = 'Upscaler',
    HYPERNETWORK = 'Hypernetwork',
    TEXTUALINVERSION = 'Embeddings',
    LORA = 'Lora',
    LOCON = 'LoCon',
    VAE = 'VAE',
    DORA = 'DoRA',
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
