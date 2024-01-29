export function useApi() {
  // Note: window.api definitions can be found in src/index.d.ts
  return {
    setKey: async (key: string) => {
      await window.api.setKey(key);
    },
    selectDirectory: async () => {
      return await window.api.selectFolder();
    },
  };
}
