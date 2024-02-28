import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ConnectionStatus } from '@/types';
import { useToast } from '@/components/ui/use-toast';

type RemoveActivityParams = {
  hash: string;
  title: string;
  description: string;
};

type ElectronContextType = {
  key?: string | null;
  appLoading: boolean;
  clearSettings: () => void;
  activityList: ActivityItem[];
  fileList: ResourcesMap;
  connectionStatus: ConnectionStatus;
  rootResourcePath: string | null;
  removeActivity: (param: RemoveActivityParams) => void;
};

const defaultValue: ElectronContextType = {
  key: null,
  appLoading: true,
  clearSettings: () => {},
  activityList: [],
  fileList: {},
  connectionStatus: ConnectionStatus.DISCONNECTED,
  rootResourcePath: null,
  removeActivity: () => {},
};

const ElectronContext = createContext<ElectronContextType>(defaultValue);
export const useElectron = () => useContext(ElectronContext);

export function ElectronProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  const [key, setKey] = useState<string | null>(null);
  const [activityList, setActivityList] = useState<ActivityItem[]>([]);
  const [fileList, setFileList] = useState<ResourcesMap>({});
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED,
  );
  const [rootResourcePath, setRootResourcePath] = useState<string | null>(null);
  const { toast } = useToast();

  // Remove activity from list
  const removeActivity = useCallback(
    ({ hash, title, description }: RemoveActivityParams) => {
      toast({
        title,
        description,
      });

      setFileList((state) => {
        const { [hash]: rm, ...rest } = state;

        return rest;
      });
    },
    [fileList],
  );

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

  // Update when file downloaded
  useEffect(() => {
    // TODO: Look at switching to listen to the store change instead of firing messages
    // ipcRenderer.on('files-update', function (_, message) {
    ipcRenderer.on('activity-add', function (_, message) {
      setFileList((files) => ({
        [message.hash]: message,
        ...files,
      }));
    });

    return () => {
      ipcRenderer.removeAllListeners('activity-add');
    };
  }, []);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setActivityList(message.activities);
      setFileList(message.files);
      setRootResourcePath(message.rootResourcePath);
      setConnectionStatus(message.connectionStatus);
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

  useEffect(() => {
    ipcRenderer.on('resource-remove', function (_, { resource }) {
      removeActivity({
        hash: resource.hash,
        title: 'Resource removed',
        description: `${resource.modelName} has been removed.`,
      });
    });

    return () => {
      ipcRenderer.removeAllListeners('resource-remove');
    };
  }, []);

  const clearSettings = () => {
    window.api.clearSettings();
    setKey(null);
    setActivityList([]);
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setRootResourcePath(null);
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
        removeActivity,
        fileList,
      }}
    >
      {children}
    </ElectronContext.Provider>
  );
}
