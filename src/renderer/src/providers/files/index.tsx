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

type sortFilesParams = {
  type: SortType;
  direction: SortDirection;
};

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

type FilterFilesByTypeParams = {
  modelType: string[];
  baseModelType: string[];
};

type FileContextType = {
  fileList: ResourcesMap;
  removeActivity: (param: RemoveActivityParams) => void;
  filteredFileList: ResourcesMap;
  filterFiles: (search: string) => void;
  searchTerm: string;
  setSearchTerm: (search: string) => void;
  fileListCount: number;
  sortFiles: ({ type, direction }: sortFilesParams) => void;
  filterFilesByType: ({
    modelType,
    baseModelType,
  }: FilterFilesByTypeParams) => void;
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
  filterFilesByType: () => {},
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
  direction: sortFilesParams['direction'],
) => {
  const sortType = type as keyof Resource;
  const filteredFileListA = a[sortType] as string;
  const filteredFileListB = b[sortType] as string;

  if (filteredFileListA && filteredFileListB) {
    if (direction === 'desc') {
      return filteredFileListB.localeCompare(filteredFileListA);
    } else {
      return filteredFileListA.localeCompare(filteredFileListB);
    }
  }

  return 0;
};

const sortDownloadDate = (
  a: Resource,
  b: Resource,
  type: keyof Resource,
  direction: sortFilesParams['direction'],
) => {
  const sortType = type as keyof Resource;
  const filteredFileListA = a[sortType] as string;
  const filteredFileListB = b[sortType] as string;

  if (filteredFileListA && filteredFileListB) {
    if (direction === 'desc') {
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
  }

  return 0;
};

const sortFileSize = (
  a: Resource,
  b: Resource,
  type: keyof Resource,
  direction: sortFilesParams['direction'],
) => {
  const sortType = type as keyof Resource;
  const filteredFileListA = a[sortType] as number;
  const filteredFileListB = b[sortType] as number;

  if (filteredFileListA && filteredFileListB) {
    if (direction === 'desc') {
      return filteredFileListB - filteredFileListA;
    } else {
      return filteredFileListA - filteredFileListB;
    }
  }

  return 0;
};

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
          return file.modelName?.toLowerCase().includes(search.toLowerCase());
        })
        .reduce(reduceFileMap, {});

      setFilteredFileList(filtered);
    },
    [fileList],
  );

  const filterFilesByType = useCallback(
    ({ modelType, baseModelType }: FilterFilesByTypeParams) => {
      const modelLength = modelType.length > 0;
      const baseModelLength = baseModelType.length > 0;
      if (!modelLength && !baseModelLength) {
        setFilteredFileList(fileList);
        return;
      }

      const filtered = Object.values(fileList)
        .filter((file) => {
          if (!file.type) return false;

          if (!modelLength) {
            return true;
          }

          return modelType.includes(file.type.toLowerCase());
        })
        .filter((file) => {
          if (!file.baseModel) return false;

          if (!baseModelLength) {
            return true;
          }

          return baseModelType.includes(file.baseModel?.toLowerCase());
        })
        .reduce(reduceFileMap, {});

      setFilteredFileList(filtered);
    },
    [fileList],
  );

  const sortFiles = ({ type, direction }: sortFilesParams) => {
    const filtered = Object.values(filteredFileList)
      .sort((a, b) => {
        if (type === 'modelName') {
          return sortModelName(a, b, type, direction);
        }
        if (type === 'downloadDate') {
          return sortDownloadDate(a, b, type, direction);
        }
        if (type === 'fileSize') {
          return sortFileSize(a, b, type, direction);
        }

        // Default to sorting by modelName
        return 0; // Return a default value of 0
      })
      .reduce(reduceFileMap, {});

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
        filterFilesByType,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}
