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
  };
}
