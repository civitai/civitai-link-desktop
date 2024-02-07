import { createContext, useContext, useEffect, useState } from 'react';
import { ConnectionStatus } from '@/types';

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
  connectionStatus: ConnectionStatus;
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
  connectionStatus: ConnectionStatus.DISCONNECTED,
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
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

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

  useEffect(() => {
    ipcRenderer.on('connection-status', function (_, message) {
      setConnectionStatus(message);
    });

    return () => {
      ipcRenderer.removeAllListeners('connection-status');
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
        connectionStatus,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}
