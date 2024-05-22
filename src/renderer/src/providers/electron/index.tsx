import { useToast } from '@/components/ui/use-toast';
import { ConnectionStatus } from '@/types';
import { createContext, useContext, useEffect, useState } from 'react';

type ElectronContextType = {
  key?: string | null;
  apiKey?: string | null;
  appLoading: boolean;
  clearSettings: () => void;
  activityList: ActivityItem[];
  connectionStatus: ConnectionStatus;
  rootResourcePath: string | null;
  settings: { nsfw: boolean; alwaysOnTop: boolean; concurrent: number };
  user?: object | null;
  appVersion: string;
  updateAvailable: boolean;
  DEBUG: boolean;
};

const defaultValue: ElectronContextType = {
  key: null,
  apiKey: null,
  appLoading: true,
  clearSettings: () => {},
  activityList: [],
  connectionStatus: ConnectionStatus.DISCONNECTED,
  rootResourcePath: null,
  settings: { nsfw: false, alwaysOnTop: false, concurrent: 10 },
  user: null,
  appVersion: '',
  updateAvailable: false,
  DEBUG: false,
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
  const [settings, setSettings] = useState(defaultValue.settings);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [user, setUser] = useState<object | null>(null);
  const [appVersion, setAppVersion] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [debug, setDebug] = useState<boolean>(false);
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

  useEffect(() => {
    ipcRenderer.on('fetch-user', function (_, updatedUser) {
      setUser(updatedUser);
    });

    return () => {
      ipcRenderer.removeAllListeners('fetch-user');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('update-api-key', function (_, updatedApiKey) {
      setApiKey(updatedApiKey);
    });

    return () => {
      ipcRenderer.removeAllListeners('update-api-key');
    };
  }, []);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setActivityList(message.activities);
      setRootResourcePath(message.rootResourcePath);
      setConnectionStatus(message.connectionStatus);
      setSettings({ ...defaultValue.settings, ...message.settings });
      setApiKey(message.apiKey);
      setUser(message.user);
      setAppVersion(message.appVersion);
      setDebug(message.DEBUG);
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

  useEffect(() => {
    ipcRenderer.on('update-available', function () {
      setUpdateAvailable(true);
    });

    return () => {
      ipcRenderer.removeAllListeners('update-available');
    };
  });

  const clearSettings = () => {
    window.api.clearSettings();
    setKey(null);
    setActivityList([]);
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setRootResourcePath(null);
    setApiKey(null);
    setUser(null);
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
        user,
        appVersion,
        updateAvailable,
        DEBUG: debug,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}
