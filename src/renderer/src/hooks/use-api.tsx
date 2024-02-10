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
    cancelDownload: async (id: string) => {
      return await window.api.cancelDownload(id);
    },
    closeApp: async () => {
      return await window.api.closeApp();
    },
  };
}
