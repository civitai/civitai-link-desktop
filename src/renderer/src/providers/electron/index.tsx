import { createContext, useContext, useEffect, useState } from 'react';
import { ConnectionStatus } from '@/types';
import { useToast } from '@/components/ui/use-toast';

type ElectronContextType = {
  key?: string | null;
  apiKey?: string | null;
  appLoading: boolean;
  clearSettings: () => void;
  activityList: ActivityItem[];
  connectionStatus: ConnectionStatus;
  rootResourcePath: string | null;
  settings: { nsfw: boolean };
};

const defaultValue: ElectronContextType = {
  key: null,
  apiKey: null,
  appLoading: true,
  clearSettings: () => {},
  activityList: [],
  connectionStatus: ConnectionStatus.DISCONNECTED,
  rootResourcePath: null,
  settings: { nsfw: false },
};

const ElectronContext = createContext<ElectronContextType>(defaultValue);
export const useElectron = () => useContext(ElectronContext);

export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  const [key, setKey] = useState<string | null>(null);
  const [activityList, setActivityList] = useState<ActivityItem[]>([]);
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED,
  );
  const [rootResourcePath, setRootResourcePath] = useState<string | null>(null);
  const [settings, setSettings] = useState({ nsfw: false });
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    ipcRenderer.on('upgrade-key', function (_, message) {
      setKey(message.key);
    });

    return () => {
      ipcRenderer.removeAllListeners('upgrade-key');
    };
  }, []);

  // Update when activity happens
  useEffect(() => {
    ipcRenderer.on('activity-update', function (_, activities) {
      setActivityList(activities);
    });

    return () => {
      ipcRenderer.removeAllListeners('activity-update');
    };
  }, []);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setActivityList(message.activities);
      setRootResourcePath(message.rootResourcePath);
      setConnectionStatus(message.connectionStatus);
      setSettings(message.settings);
      setApiKey(message.apiKey);
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

  useEffect(() => {
    ipcRenderer.on('settings-update', function (_, newSettings) {
      setSettings(newSettings);
    });

    return () => {
      ipcRenderer.removeAllListeners('settings-update');
    };
  });

  const clearSettings = () => {
    window.api.clearSettings();
    setKey(null);
    setActivityList([]);
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setRootResourcePath(null);
    setApiKey(null);
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
        settings,
        apiKey,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}
