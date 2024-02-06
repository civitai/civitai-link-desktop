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
  appLoading: boolean;
  clearSettings: () => void;
  activityList: Activity[];
};

const defaultValue: ElectronContextType = {
  key: null,
  resources: [],
  modelDirectories: {
    lora: '',
    model: '',
    lycoris: '',
  },
  appLoading: true,
  clearSettings: () => {},
  activityList: [],
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
  const [activityList, setActivityList] = useState<any[]>([]);
  const [appLoading, setAppLoading] = useState<boolean>(true);

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
      setActivityList(message.activityList);
    });

    return () => {
      ipcRenderer.removeAllListeners('store-ready');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('app-ready', function () {
      setAppLoading(false);
    });

    return () => {
      ipcRenderer.removeAllListeners('app-ready');
    };
  }, []);

  const clearSettings = () => {
    window.api.clearSettings();
    setKey(null);
    setResources([]);
    setModelDirectories({
      lora: '',
      model: '',
      lycoris: '',
    });
  };

  return (
    <ElectronContext.Provider
      value={{
        key,
        resources,
        modelDirectories,
        appLoading,
        clearSettings,
        activityList,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}
