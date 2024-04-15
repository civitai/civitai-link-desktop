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

type sortType = 'modelName' | 'dateDownloaded';

type FileContextType = {
  fileList: ResourcesMap;
  removeActivity: (param: RemoveActivityParams) => void;
  filteredFileList: ResourcesMap;
  filterFiles: (search: string) => void;
  searchTerm: string;
  setSearchTerm: (search: string) => void;
  fileListCount: number;
  sortFiles: ({
    type,
    direction,
  }: {
    type: sortType;
    direction: 'asc' | 'desc';
  }) => void;
};

const defaultValue: FileContextType = {
  fileList: {},
  removeActivity: () => {},
  filteredFileList: {},
  filterFiles: () => {},
  searchTerm: '',
  setSearchTerm: () => {},
  fileListCount: 0,
  sortFiles: () => {},
};

const FileContext = createContext<FileContextType>(defaultValue);
export const useFile = () => useContext(FileContext);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  // Full source of files
  const [fileList, setFileList] = useState<ResourcesMap>({});
  // Filtered source of files (whats displayed)
  const [filteredFileList, setFilteredFileList] = useState<ResourcesMap>({});
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const { cancelDownload } = useApi();

  // Remove activity from list
  const removeActivity = useCallback(
    ({ hash, title, description }: RemoveActivityParams) => {
      toast({
        title,
        description,
      });

      setFilteredFileList((state) => {
        const { [hash]: rm, ...rest } = state;

        return rest;
      });

      setFileList((state) => {
        const { [hash]: rm, ...rest } = state;

        return rest;
      });
    },
    [fileList, filteredFileList],
  );

  const filterFiles = useCallback(
    (search: string) => {
      if (!search) {
        setFilteredFileList(fileList);
        return;
      }

      const filtered = Object.values(fileList)
        .filter((file) => {
          return file.modelName.toLowerCase().includes(search.toLowerCase());
        })
        .reduce<Record<string, Resource>>((acc, file) => {
          return {
            ...acc,
            [file.hash]: file,
          };
        }, {});

      setFilteredFileList(filtered);
    },
    [fileList],
  );

  const sortFiles = ({
    type,
    direction,
  }: {
    type: 'modelName' | 'dateDownloaded';
    direction: 'asc' | 'desc';
  }) => {
    const filtered = Object.keys(filteredFileList)
      .sort((a, b) => {
        const sortType = type as keyof Resource;
        const filteredFileListA = filteredFileList[a][sortType] as string;
        const filteredFileListB = filteredFileList[b][sortType] as string;

        if (filteredFileListA && filteredFileListB) {
          if (direction === 'desc') {
            return filteredFileListB.localeCompare(filteredFileListA);
          } else {
            return filteredFileListA.localeCompare(filteredFileListB);
          }
        }

        return 0;
      })
      .reduce<Record<string, Resource>>((acc, key) => {
        return {
          ...acc,
          [key]: filteredFileList[key],
        };
      }, {});

    setFilteredFileList(filtered);
  };

  // Update when download starts
  useEffect(() => {
    ipcRenderer.on('activity-add', function (_, message) {
      setFileList((files) => ({
        [message.hash]: message,
        ...files,
      }));

      if (!searchTerm || message.modelName.toLowerCase().includes(searchTerm)) {
        setFilteredFileList((files) => ({
          [message.hash]: message,
          ...files,
        }));
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('activity-add');
    };
  }, [searchTerm, filteredFileList]);

  // Update when download finishes
  useEffect(() => {
    ipcRenderer.on('files-update', function (_, files) {
      setFileList(files);

      if (!searchTerm) {
        setFilteredFileList(files);
      } else {
        filterFiles(searchTerm);
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('files-update');
    };
  }, [searchTerm]);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setFileList(message.files);
      setFilteredFileList(message.files);
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
        filteredFileList,
        filterFiles,
        searchTerm,
        setSearchTerm,
        fileListCount: Object.keys(fileList).length,
        sortFiles,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}
