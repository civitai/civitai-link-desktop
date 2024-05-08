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
  sortFileSize,
  sortResource,
} from '@/lib/search-filter';
import Fuse, { type FuseResult, type Expression } from 'fuse.js';

type RemoveActivityParams = {
  hash: string;
};

export enum FileListFilters {
  TYPE = 'type',
  BASE_MODEL = 'baseModel',
}

type FileContextType = {
  removeActivity: (param: RemoveActivityParams) => void;
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
  fileHashMap: Record<string, Resource>;
  fuseList: { item: Resource }[];
  fileListCount: number;
};

const defaultValue: FileContextType = {
  removeActivity: () => {},
  searchFiles: () => {},
  searchTerm: '',
  setSearchTerm: () => {},
  sortFiles: () => {},
  sortDirection: SortDirection.DESC,
  sortType: null,
  clearFilters: () => {},
  filterFiles: () => {},
  appliedFilters: {
    modelType: [],
    baseModelType: [],
  },
  fuseList: [],
  fileHashMap: {},
  fileListCount: 0,
};

const FileContext = createContext<FileContextType>(defaultValue);
export const useFile = () => useContext(FileContext);

const models: Resource[] = [];
const fuse = new Fuse(models, {
  keys: ['modelName', 'name', 'baseModel', 'type'],
  threshold: 0.3,
});

function mapHashToFuse(files: Record<string, Resource>) {
  const filesToMap: Resource[] = Object.values(files);
  return filesToMap.map((doc, idx) => ({
    item: doc,
    score: 1,
    refIndex: idx,
  }));
}

export function FileProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  // Keep track of Fuse search results
  const [fuseList, setFuseList] = useState<FuseResult<Resource>[]>([]);
  // Keep track of all files by hash
  const [fileHashMap, setFileHashMap] = useState<Record<string, Resource>>({});

  // Filtered source of files (whats displayed)
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
  const removeActivity = useCallback(({ hash }: RemoveActivityParams) => {
    fuse.remove((doc: Resource) => doc.hash === hash);
    setFileHashMap((prev) => {
      const newFileHashMap = { ...prev };
      delete newFileHashMap[hash];
      return newFileHashMap;
    });
    setFuseList((prev) => {
      return prev.filter((doc) => doc.item.hash !== hash);
    });
  }, []);

  const searchFiles = useCallback(
    (search: string) => {
      let filters: Expression = {
        $and: [],
      };

      if (search.length) {
        filters.$and?.push({ $or: [{ modelName: search }, { name: search }] });
      }

      if (modelTypeArray.length) {
        filters.$and?.push({
          $or: modelTypeArray.map((type) => ({ type: `'${type}` })),
        });
      }

      if (baseModelArray.length) {
        filters.$and?.push({
          $or: baseModelArray.map((base) => ({ baseModel: `'${base}` })),
        });
      }

      const searchResults: any[] =
        search.length || modelTypeArray.length || baseModelArray.length
          ? fuse.search(filters)
          : mapHashToFuse(fileHashMap);

      setFuseList(
        searchResults.sort((a, b) => {
          if (sortType === SortType.FILE_SIZE) {
            return sortFileSize(a.item, b.item, sortType, sortDirection);
          }

          return sortResource(a.item, b.item, sortType, sortDirection);
        }),
      );
    },
    [sortType, sortDirection, modelTypeArray, baseModelArray, fileHashMap],
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
  }, [
    searchTerm,
    sortDirection,
    sortType,
    modelTypeArray,
    baseModelArray,
    fileHashMap,
  ]);

  // Update when download starts
  useEffect(() => {
    ipcRenderer.on('activity-add', function (_, message) {
      fuse.add(message);
      setFileHashMap((prev) => {
        const newFileHashMap = { ...prev };
        newFileHashMap[message.hash.toLowerCase()] = message;
        return newFileHashMap;
      });

      setFuseList((prev) => {
        return [
          {
            item: message,
            score: 1,
            refIndex: prev.length,
          },
          ...prev,
        ];
      });
    });

    return () => {
      ipcRenderer.removeAllListeners('activity-add');
    };
  }, [searchTerm]);

  // Update when download finishes
  useEffect(() => {
    ipcRenderer.on('files-update', function (_, files) {
      const fuseFiles: never[] = Object.values(files);

      fuse.setCollection(fuseFiles);

      setFileHashMap((prev) => {
        return {
          ...prev,
          ...files,
        };
      });

      searchFiles(searchTerm);
    });

    return () => {
      ipcRenderer.removeAllListeners('files-update');
    };
  }, [searchTerm]);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      const fuseFiles: never[] = Object.values(message.files);

      fuse.setCollection(fuseFiles);

      // Hack to show initial list
      const list: any[] = mapHashToFuse(message.files);
      setFuseList(list);
      setFileHashMap(message.files);
    });

    return () => {
      ipcRenderer.removeAllListeners('store-ready');
    };
  }, []);

  // Remove resource from list through Site
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

  // Cancel download in progress
  useEffect(() => {
    ipcRenderer.on('activity-cancel', function (_, { id }) {
      cancelDownload(id);
    });

    return () => {
      ipcRenderer.removeAllListeners('activity-cancel');
    };
  }, []);

  return (
    <FileContext.Provider
      value={{
        removeActivity,
        searchFiles,
        searchTerm,
        setSearchTerm,
        sortFiles,
        sortDirection,
        sortType,
        clearFilters,
        filterFiles,
        appliedFilters: {
          modelType: modelTypeArray,
          baseModelType: baseModelArray,
        },
        fuseList,
        fileHashMap,
        fileListCount: Object.keys(fileHashMap).length,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}
