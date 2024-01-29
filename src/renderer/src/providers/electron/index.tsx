import { createContext, useContext, useEffect, useState } from 'react';

type ElectronContextType = {
  key?: string | null;
  resources?: { id: string; name: string }[];
};

const defaultValue: ElectronContextType = {
  key: null,
  resources: [],
};

const ElectronContext = createContext<ElectronContextType>(defaultValue);
export const useElectron = () => useContext(ElectronContext);

export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState<string | null>(null);
  const [resources, setResources] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    window.electron.ipcRenderer.on('upgrade-key', function (_, message) {
      setKey(message.key);
    });
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.on('resource-add', function (_, message) {
      // @ts-ignore
      setResources((resources) => [...resources, message]);
    });
  }, []);

  return (
    <ElectronContext.Provider
      value={{
        key,
        resources,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}
