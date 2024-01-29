import { createContext, useContext, useEffect, useState } from 'react';

// TODO: Split up types to re-use all over
type ElectronContextType = {
  key?: string | null;
  resources?: { id: string; name: string }[];
  modelDirectories: {
    lora: string;
    model: string;
    lycoris: string;
  };
};

const defaultValue: ElectronContextType = {
  key: null,
  resources: [],
  modelDirectories: {
    lora: '',
    model: '',
    lycoris: '',
  },
};

const ElectronContext = createContext<ElectronContextType>(defaultValue);
export const useElectron = () => useContext(ElectronContext);

export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  const [key, setKey] = useState<string | null>(null);
  const [resources, setResources] = useState<{ id: string; name: string }[]>([]);
  const [modelDirectories, setModelDirectories] = useState<{
    lora: string;
    model: string;
    lycoris: string;
  }>({
    lora: '',
    model: '',
    lycoris: '',
  });

  // TODO: Add on load to let the app know when the store has been accessed

  useEffect(() => {
    ipcRenderer.on('upgrade-key', function (_, message) {
      setKey(message.key);
    });

    return () => {
      ipcRenderer.removeAllListeners('upgrade-key');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('resource-add', function (_, message) {
      // @ts-ignore
      setResources((resources) => [...resources, message]);
    });

    return () => {
      ipcRenderer.removeAllListeners('resource-add');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setModelDirectories(message.modelDirectories);
    });

    return () => {
      ipcRenderer.removeAllListeners('store-ready');
    };
  }, []);

  return (
    <ElectronContext.Provider
      value={{
        key,
        resources,
        modelDirectories,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}
