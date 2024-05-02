import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useApi } from '@/hooks/use-api';
import {
  SortType,
  SortDirection,
  reduceFileMap,
  sortFileSize,
  sortResource,
} from '@/lib/search-filter';

type RemoveActivityParams = {
  hash: string;
};

export enum FileListFilters {
  TYPE = 'type',
  BASE_MODEL = 'baseModel',
}

type FileContextType = {
  fileList: ResourcesMap;
  removeActivity: (param: RemoveActivityParams) => void;
  fileListCount: number;
  filteredFileList: ResourcesMap;
  searchFiles: (search: string) => void;
  searchTerm: string;
  setSearchTerm: (search: string) => void;
  sortFiles: (type: SortType) => void;
  sortDirection?: SortDirection;
  sortType: SortType | null;
  clearFilters: () => void;
  filterFiles: (type: string, filterType: FileListFilters) => void;
  appliedFilters: {
    modelType: string[];
    baseModelType: string[];
  };
};

const defaultValue: FileContextType = {
  fileList: {},
  removeActivity: () => {},
  filteredFileList: {},
  searchFiles: () => {},
  searchTerm: '',
  setSearchTerm: () => {},
  fileListCount: 0,
  sortFiles: () => {},
  sortDirection: SortDirection.DESC,
  sortType: null,
  clearFilters: () => {},
  filterFiles: () => {},
  appliedFilters: {
    modelType: [],
    baseModelType: [],
  },
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
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.DESC,
  );
  const [sortType, setSortType] = useState<SortType>(SortType.DOWNLOAD_DATE);

  // Filter types
  const [modelTypeArray, setModelTypeArray] = useState<string[]>([]);
  const [baseModelArray, setBaseModelArray] = useState<string[]>([]);

  const { cancelDownload } = useApi();

  // Remove activity from list
  const removeActivity = useCallback(
    ({ hash }: RemoveActivityParams) => {
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

  const searchFiles = useCallback(
    (search: string) => {
      const modelLength = modelTypeArray.length > 0;
      const baseModelLength = baseModelArray.length > 0;

      const filtered = Object.values(fileList)
        .filter((file) => {
          if (search === '') {
            return true;
          }

          return file.modelName?.toLowerCase().includes(search.toLowerCase());
        })
        .filter((file) => {
          if (!file.type) return false;

          if (!modelLength) {
            return true;
          }

          return modelTypeArray.includes(file.type.toLowerCase());
        })
        .filter((file) => {
          if (!file.baseModel) return false;

          if (!baseModelLength) {
            return true;
          }

          return baseModelArray.includes(file.baseModel?.toLowerCase());
        })
        .sort((a, b) => {
          if (sortType === SortType.FILE_SIZE) {
            return sortFileSize(a, b, sortType, sortDirection);
          }

          return sortResource(a, b, sortType, sortDirection);
        })
        .reduce(reduceFileMap, {});

      setFilteredFileList(filtered);
    },
    [fileList, sortType, sortDirection, modelTypeArray, baseModelArray],
  );

  const sortFiles = (type: SortType) => {
    setSortType(type);
    setSortDirection(
      sortDirection === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC,
    );

    searchFiles(searchTerm);
  };

  const filterFiles = (type: string, filterType: FileListFilters) => {
    const typeLowerCase = type.toLowerCase();
    let modelType: string[] = [...modelTypeArray];
    let baseModelType: string[] = [...baseModelArray];

    if (filterType === FileListFilters.BASE_MODEL) {
      if (baseModelArray.includes(typeLowerCase)) {
        const newBaseModelArray = baseModelArray.filter(
          (baseModelType) => baseModelType !== typeLowerCase,
        );
        setBaseModelArray(newBaseModelArray);

        baseModelType = newBaseModelArray;
      } else {
        setBaseModelArray([...baseModelArray, typeLowerCase]);
        baseModelType = [...baseModelArray, typeLowerCase];
      }
    }

    if (filterType === FileListFilters.TYPE) {
      if (modelTypeArray.includes(typeLowerCase)) {
        const newModelTypeArray = modelTypeArray.filter(
          (modelType) => modelType !== typeLowerCase,
        );
        setModelTypeArray(newModelTypeArray);

        modelType = newModelTypeArray;
      } else {
        setModelTypeArray([...modelTypeArray, typeLowerCase]);
        modelType = [...modelTypeArray, typeLowerCase];
      }
    }

    setBaseModelArray(baseModelType);
    setModelTypeArray(modelType);
    searchFiles(searchTerm);
  };

  const clearFilters = () => {
    setModelTypeArray([]);
    setBaseModelArray([]);

    searchFiles(searchTerm);
  };

  useEffect(() => {
    searchFiles(searchTerm);
  }, [searchTerm, sortDirection, sortType, modelTypeArray, baseModelArray]);

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
      setFilteredFileList(files);
    });

    return () => {
      ipcRenderer.removeAllListeners('files-update');
    };
  }, [searchTerm, sortDirection, sortType, modelTypeArray, baseModelArray]);

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
        searchFiles,
        searchTerm,
        setSearchTerm,
        fileListCount: Object.keys(fileList).length,
        sortFiles,
        sortDirection,
        sortType,
        clearFilters,
        filterFiles,
        appliedFilters: {
          modelType: modelTypeArray,
          baseModelType: baseModelArray,
        },
      }}
    >
      {children}
    </FileContext.Provider>
  );
}
