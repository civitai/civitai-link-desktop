import { createContext, useContext, useEffect, useState } from 'react';
import { ConnectionStatus } from '@/types';

type ElectronContextType = {
  key?: string | null;
  resources?: Resource[];
  appLoading: boolean;
  clearSettings: () => void;
  activityList: Activity[];
  connectionStatus: ConnectionStatus;
};

const defaultValue: ElectronContextType = {
  key: null,
  resources: [],
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
  const [resources, setResources] = useState<Resource[]>([]);
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
  };

  return (
    <ElectronContext.Provider
      value={{
        key,
        resources,
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
