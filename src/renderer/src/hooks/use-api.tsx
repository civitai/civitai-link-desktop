export function useApi() {
  // Note: window.api definitions can be found in src/index.d.ts
  return {
    setKey: async (key: string) => {
      return await window.api.setKey(key);
    },
    selectDirectory: async () => {
      return await window.api.selectFolder();
    },
    setRootResourcePath: async (path: string) => {
      return await window.api.setRootResourcePath(path);
    },
    setResourcePath: async (type: ResourceType, path: string) => {
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
    getResourcePath: async (type: ResourceType) => {
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
  };
}
