import { createContext, useContext, useEffect, useState } from 'react';
import { ConnectionStatus } from '@/types';
import { useToast } from '@/components/ui/use-toast';

type ElectronContextType = {
  key?: string | null;
  appLoading: boolean;
  clearSettings: () => void;
  activityList: ResourcesMap;
  connectionStatus: ConnectionStatus;
  rootResourcePath: string | null;
};

const defaultValue: ElectronContextType = {
  key: null,
  appLoading: true,
  clearSettings: () => {},
  activityList: {},
  connectionStatus: ConnectionStatus.DISCONNECTED,
  rootResourcePath: null,
};

const ElectronContext = createContext<ElectronContextType>(defaultValue);
export const useElectron = () => useContext(ElectronContext);

export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  const [key, setKey] = useState<string | null>(null);
  const [activityList, setActivityList] = useState<ResourcesMap>({});
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [rootResourcePath, setRootResourcePath] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    ipcRenderer.on('upgrade-key', function (_, message) {
      setKey(message.key);
    });

    return () => {
      ipcRenderer.removeAllListeners('upgrade-key');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('activity-add', function (_, message) {
      // @ts-ignore
      setActivityList((activities) => ({ [message.hash]: message, ...activities }));
    });

    return () => {
      ipcRenderer.removeAllListeners('activity-add');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setActivityList(message.activities);
      setRootResourcePath(message.rootResourcePath);
    });

    return () => {
      ipcRenderer.removeAllListeners('store-ready');
    };
  }, []);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('app-ready', function () {
      setAppLoading(false);
    });

    return () => {
      ipcRenderer.removeAllListeners('app-ready');
    };
  }, []);

  // Bug: When reloading the UI it does not get an update about connection status
  // Instead it uses the default set in useState
  useEffect(() => {
    ipcRenderer.on('connection-status', function (_, message) {
      setConnectionStatus(message);
    });

    return () => {
      ipcRenderer.removeAllListeners('connection-status');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('error', function (_, message) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong!',
        description: message,
      });
    });

    return () => {
      ipcRenderer.removeAllListeners('connection-status');
    };
  }, []);

  const clearSettings = () => {
    window.api.clearSettings();
    setKey(null);
    setActivityList({});
  };

  return (
    <ElectronContext.Provider
      value={{
        key,
        appLoading,
        clearSettings,
        activityList,
        connectionStatus,
        rootResourcePath,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}
