import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useApi } from '@/hooks/use-api';

type RemoveActivityParams = {
  hash: string;
  title: string;
  description: string;
};

type FileContextType = {
  fileList: ResourcesMap;
  removeActivity: (param: RemoveActivityParams) => void;
};

const defaultValue: FileContextType = {
  fileList: {},
  removeActivity: () => {},
};

const FileContext = createContext<FileContextType>(defaultValue);
export const useFile = () => useContext(FileContext);

// TODO: Remove these from ElectronProvider
export function FileProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  const [fileList, setFileList] = useState<ResourcesMap>({});
  const { toast } = useToast();
  const { cancelDownload } = useApi();

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

  // Update when download starts
  useEffect(() => {
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

  // Update when download finishes
  useEffect(() => {
    ipcRenderer.on('files-update', function (_, files) {
      setFileList(files);
    });

    return () => {
      ipcRenderer.removeAllListeners('files-update');
    };
  }, []);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setFileList(message.files);
    });

    return () => {
      ipcRenderer.removeAllListeners('store-ready');
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

  // This is a super hacky way to cancel downloads
  useEffect(() => {
    ipcRenderer.on('activity-cancel', function (_, { id }) {
      const fileKeys = Object.keys(fileList);
      const fileToRemove = fileKeys.find((file) => fileList[file].id === id);
      cancelDownload(id);

      if (fileToRemove) {
        removeActivity({
          hash: fileList[fileToRemove].hash,
          title: 'Download canceled',
          description: `The download for ${fileList[fileToRemove].modelName} has been canceled.`,
        });
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('activity-cancel');
    };
  });

  return (
    <FileContext.Provider
      value={{
        fileList,
        removeActivity,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}
