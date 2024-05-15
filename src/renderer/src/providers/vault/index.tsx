import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useApi } from '@/hooks/use-api';
import { VaultSortType, SortDirection } from '@/lib/search-filter';

type VaultMeta = {
  usedStorageKb: number;
  storageKb: number;
};

export enum VaultFilters {
  TYPE = 'type',
  BASE_MODEL = 'baseModel',
}

export type VaultItem = {
  id: number;
  status: 'Pending' | 'Stored';
  modelName: string;
  versionName: string;
  type: string;
  modelId: number;
  modelVersionId: number;
  coverImageUrl: string;
  files: { url: string }[];
  baseModel: string;
  modelSizeKb: number;
  addedAt: string;
};

type VaultContextType = {
  refetchVault: () => void;
  canRefresh: boolean;
  refetchDate?: Date | null;
  vaultMeta: VaultMeta | null;
  vault: VaultItem[];
  filteredVault: VaultItem[];
  setSearchTerm: (search: string) => void;
  searchVault: (search: string) => void;
  searchTerm: string;
  sortVault: (type: VaultSortType) => void;
  sortDirection?: SortDirection;
  sortType: VaultSortType | null;
  clearFilters: () => void;
  filterVault: (type: string, filterType: VaultFilters) => void;
  appliedFilters: {
    modelType: string[];
    baseModelType: string[];
  };
};

const defaultValue: VaultContextType = {
  refetchVault: () => {},
  canRefresh: true,
  refetchDate: null,
  vaultMeta: null,
  vault: [],
  filteredVault: [],
  setSearchTerm: () => {},
  searchVault: () => {},
  searchTerm: '',
  sortVault: () => {},
  sortDirection: SortDirection.DESC,
  sortType: null,
  clearFilters: () => {},
  filterVault: () => {},
  appliedFilters: {
    modelType: [],
    baseModelType: [],
  },
};

const VaultContext = createContext<VaultContextType>(defaultValue);
export const useVault = () => useContext(VaultContext);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  const { fetchVaultMeta, fetchVaultModels } = useApi();
  const [vaultMeta, setVaultMeta] = useState<VaultMeta | null>(null);
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [filteredVault, setFilteredVault] = useState<VaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refetchDate, setRefetchDate] = useState<Date | null>(null);
  const [canRefresh, setCanRefresh] = useState(true);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.DESC,
  );
  const [sortType, setSortType] = useState<VaultSortType>(
    VaultSortType.ADDED_DATE,
  );

  // Filter types
  const [modelTypeArray, setModelTypeArray] = useState<string[]>([]);
  const [baseModelArray, setBaseModelArray] = useState<string[]>([]);

  const searchVault = useCallback(
    (search: string) => {
      const modelLength = modelTypeArray.length > 0;
      const baseModelLength = baseModelArray.length > 0;

      const filtered = vault
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
          if (sortDirection === SortDirection.DESC) {
            if (sortType === VaultSortType.MODEL_NAME) {
              return a.modelName.localeCompare(b.modelName);
            }
            if (sortType === VaultSortType.ADDED_DATE) {
              return (
                new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
              );
            }
            if (sortType === VaultSortType.FILE_SIZE) {
              return a.modelSizeKb - b.modelSizeKb;
            }
          } else {
            if (sortType === VaultSortType.MODEL_NAME) {
              return b.modelName.localeCompare(a.modelName);
            }
            if (sortType === VaultSortType.ADDED_DATE) {
              return (
                new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
              );
            }
            if (sortType === VaultSortType.FILE_SIZE) {
              return b.modelSizeKb - a.modelSizeKb;
            }
          }

          // Default
          return 1;
        });

      setFilteredVault(filtered);
    },
    [vault, sortType, sortDirection, modelTypeArray, baseModelArray],
  );

  const sortVault = (type: VaultSortType) => {
    setSortType(type);
    setSortDirection(
      sortDirection === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC,
    );

    searchVault(searchTerm);
  };

  const filterVault = (type: string, filterType: VaultFilters) => {
    const typeLowerCase = type.toLowerCase();
    let modelType: string[] = [...modelTypeArray];
    let baseModelType: string[] = [...baseModelArray];

    if (filterType === VaultFilters.BASE_MODEL) {
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

    if (filterType === VaultFilters.TYPE) {
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
    searchVault(searchTerm);
  };

  const clearFilters = () => {
    setModelTypeArray([]);
    setBaseModelArray([]);

    searchVault(searchTerm);
  };

  const refetchVault = useCallback(() => {
    // Refetch if havent recently or over 5 minutes
    if (
      refetchDate === null ||
      new Date().getTime() - refetchDate.getTime() > 60_000
    ) {
      setRefetchDate(new Date());
      fetchVaultMeta();
      fetchVaultModels();
      setCanRefresh(false);

      // Set timer to allow refresh
      setTimeout(() => {
        setCanRefresh(true);
      }, 60_000);
    }
  }, [refetchDate]);

  useEffect(() => {
    searchVault(searchTerm);
  }, [searchTerm, sortDirection, sortType, modelTypeArray, baseModelArray]);

  useEffect(() => {
    ipcRenderer.on('vault-meta-update', function (_, message) {
      setVaultMeta(message);
    });

    return () => {
      ipcRenderer.removeAllListeners('vault-meta-update');
    };
  }, []);

  useEffect(() => {
    ipcRenderer.on('vault-update', function (_, message) {
      setVault(message);
      setFilteredVault(message);
    });

    return () => {
      ipcRenderer.removeAllListeners('vault-update');
    };
  }, []);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setVaultMeta(message.vaultMeta);
      setVault(message.vault);
      setFilteredVault(message.vault);
    });

    return () => {
      ipcRenderer.removeAllListeners('store-ready');
    };
  }, []);

  return (
    <VaultContext.Provider
      value={{
        refetchVault,
        canRefresh,
        refetchDate,
        vaultMeta,
        vault,
        filteredVault,
        setSearchTerm,
        searchVault,
        searchTerm,
        sortVault,
        sortDirection,
        sortType,
        clearFilters,
        filterVault,
        appliedFilters: {
          modelType: modelTypeArray,
          baseModelType: baseModelArray,
        },
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
