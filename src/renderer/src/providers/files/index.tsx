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

export enum SortType {
  MODEL_NAME = 'modelName',
  DOWNLOAD_DATE = 'downloadDate',
  FILE_SIZE = 'fileSize',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum FileListFilters {
  TYPE = 'type',
  BASE_MODEL = 'baseModel',
}

export enum ModelTypes {
  CHECKPOINT = 'Checkpoint',
  EMBEDDING = 'Embedding',
  HYPERNETWORK = 'Hypernetwork',
  AESTHETIC_GRADIENT = 'Aesthetic Gradient',
  LORA = 'LoRA',
  LYCORIS = 'LyCORIS',
  DORA = 'DoRA',
  CONTROLNET = 'ControlNet',
  UPSCALER = 'Upscaler',
  MOTION = 'Motion',
  VAE = 'VAE',
  POSES = 'Poses',
  WILDCARDS = 'Wildcards',
  WORKFLOWS = 'Workflows',
}

export enum BaseModels {
  SD_1_5 = 'SD 1.5',
  SDXL_1_0 = 'SDXL 1.0',
  PONY = 'Pony',
}

type FileContextType = {
  fileList: ResourcesMap;
  removeActivity: (param: RemoveActivityParams) => void;
  filteredFileList: ResourcesMap;
  searchFiles: (search: string) => void;
  searchTerm: string;
  setSearchTerm: (search: string) => void;
  fileListCount: number;
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

const reduceFileMap = (
  acc: Record<string, Resource>,
  file: Resource,
): Record<string, Resource> => {
  return {
    ...acc,
    [file.hash]: file,
  };
};

const sortModelName = (
  a: Resource,
  b: Resource,
  type: keyof Resource,
  direction: SortDirection,
) => {
  const sortType = type as keyof Resource;
  const filteredFileListA = a[sortType] as string;
  const filteredFileListB = b[sortType] as string;

  if (!filteredFileListA) return 1;
  if (!filteredFileListB) return -1;

  if (direction === SortDirection.DESC) {
    return filteredFileListB.localeCompare(filteredFileListA);
  } else {
    return filteredFileListA.localeCompare(filteredFileListB);
  }
};

const sortDownloadDate = (
  a: Resource,
  b: Resource,
  type: keyof Resource,
  direction: SortDirection,
) => {
  const sortType = type as keyof Resource;
  const filteredFileListA = a[sortType] as string;
  const filteredFileListB = b[sortType] as string;

  if (!filteredFileListA) return 1;
  if (!filteredFileListB) return -1;

  if (direction === SortDirection.DESC) {
    return (
      new Date(filteredFileListB).getTime() -
      new Date(filteredFileListA).getTime()
    );
  } else {
    return (
      new Date(filteredFileListA).getTime() -
      new Date(filteredFileListB).getTime()
    );
  }
};

const sortFileSize = (
  a: Resource,
  b: Resource,
  type: keyof Resource,
  direction: SortDirection,
) => {
  const sortType = type as keyof Resource;
  const filteredFileListA = a[sortType] as number;
  const filteredFileListB = b[sortType] as number;

  if (!filteredFileListA) return 1;
  if (!filteredFileListB) return -1;

  if (direction === SortDirection.DESC) {
    return filteredFileListA - filteredFileListB;
  } else {
    return filteredFileListB - filteredFileListA;
  }
};

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
          if (sortType === SortType.MODEL_NAME) {
            return sortModelName(a, b, sortType, sortDirection);
          }
          if (sortType === SortType.DOWNLOAD_DATE) {
            return sortDownloadDate(a, b, sortType, sortDirection);
          }
          if (sortType === SortType.FILE_SIZE) {
            return sortFileSize(a, b, sortType, sortDirection);
          }

          // Default to sorting by modelName
          return 1;
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

      if (!searchTerm) {
        setFilteredFileList(files);
      } else {
        searchFiles(searchTerm);
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
