export function useApi() {
  // Note: window.api definitions can be found in src/index.d.ts
  return {
    setKey: async (key: string) => {
      return await window.api.setKey(key);
    },
    selectDirectory: async (dirPath: string) => {
      return await window.api.selectFolder(dirPath);
    },
    setRootResourcePath: async (path: string) => {
      return await window.api.setRootResourcePath(path);
    },
    setResourcePath: async (type: keyof typeof ResourceType, path: string) => {
      return await window.api.setResourcePath(type, path);
    },
    cancelDownload: async (id: string) => {
      return await window.api.cancelDownload(id);
    },
    closeApp: async () => {
      return await window.api.closeApp();
    },
    resourceRemove: async (resource: Resource) => {
      return await window.api.resourceRemove(resource);
    },
    getRootPath: async () => {
      return await window.api.getRootPath();
    },
    getResourcePath: async (type: keyof typeof ResourceType) => {
      return await window.api.getResourcePath(type);
    },
    openRootModelFolder: async () => {
      return await window.api.openRootModelFolder();
    },
    init: async () => {
      return await window.api.init();
    },
    setNSFW: async (nsfw: boolean) => {
      return await window.api.setNSFW(nsfw);
    },
    setConcurrent: async (concurrent: number) => {
      return await window.api.setConcurrent(concurrent);
    },
    openModelFileFolder: async (filePath: string) => {
      return await window.api.openModelFileFolder(filePath);
    },
    setApiKey: async (key: string) => {
      return await window.api.setApiKey(key);
    },
    fetchVaultMeta: async () => {
      return await window.api.fetchVaultMeta();
    },
    toggleVaultItem: async ({
      hash,
      modelVersionId,
    }: {
      hash?: string;
      modelVersionId: number;
    }) => {
      return await window.api.toggleVaultItem({ hash, modelVersionId });
    },
    setStableDiffusion: async (type: string) => {
      return await window.api.setStableDiffusion(type);
    },
    searchFile: async (hash: string) => {
      return await window.api.searchFile(hash);
    },
    restartApp: async () => {
      return await window.api.restartApp();
    },
    fetchMetadata: async (localPath: string) => {
      return await window.api.fetchMetadata(localPath);
    },
    fetchVaultModels: async () => {
      return await window.api.fetchVaultModels();
    },
    setAlwaysOnTop: async (alwaysOnTop: boolean) => {
      return await window.api.setAlwaysOnTop(alwaysOnTop);
    },
    fetchFileNotes: async (hash: string) => {
      return await window.api.fetchFileNotes(hash);
    },
    saveFileNotes: async (hash: string, notes: string) => {
      return await window.api.saveFileNotes(hash, notes);
    },
    downloadVaultItem: async (resource: {
      url: string;
      name: string;
      id: number;
      type: string;
    }) => {
      return await window.api.downloadVaultItem(resource);
    },
    cancelVaultDownload: async (id: number) => {
      return await window.api.cancelVaultDownload(id);
    },
    getFileByHash: async (hash: string): Promise<Resource> => {
      return await window.api.getFileByHash(hash);
    },
  };
}
