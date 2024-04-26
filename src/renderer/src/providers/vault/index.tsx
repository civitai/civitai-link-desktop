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

export type VaultItem = {
  id: number;
  modelName: string;
  versionName: string;
  type: string;
  modelId: number;
  modelVersionId: number;
  coverImageUrl: string;
  files: { url: string }[];
};

type VaultContextType = {
  refetchVault: () => void;
  canRefresh: boolean;
  vaultMeta: VaultMeta | null;
  vault: VaultItem[];
  filteredVault: VaultItem[];
  setSearchTerm: (search: string) => void;
  searchVault: (search: string) => void;
  searchTerm: string;
  sortVault: (type: VaultSortType) => void;
  sortDirection?: SortDirection;
  sortType: VaultSortType | null;
};

const defaultValue: VaultContextType = {
  refetchVault: () => {},
  canRefresh: true,
  vaultMeta: null,
  vault: [],
  filteredVault: [],
  setSearchTerm: () => {},
  searchVault: () => {},
  searchTerm: '',
  sortVault: () => {},
  sortDirection: SortDirection.DESC,
  sortType: null,
};

const VaultContext = createContext<VaultContextType>(defaultValue);
export const useVault = () => useContext(VaultContext);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  const { fetchVaultMeta } = useApi();
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
    VaultSortType.MODEL_NAME,
  );

  const searchVault = useCallback(
    (search: string) => {
      const filtered = vault
        .filter((file) => {
          if (search === '') {
            return true;
          }

          return file.modelName?.toLowerCase().includes(search.toLowerCase());
        })
        .sort((a, b) => {
          if (sortDirection === SortDirection.DESC) {
            if (sortType === VaultSortType.MODEL_NAME) {
              return a.modelName.localeCompare(b.modelName);
            }
          } else {
            if (sortType === VaultSortType.MODEL_NAME) {
              return b.modelName.localeCompare(a.modelName);
            }
          }

          // Default
          return 1;
        });

      setFilteredVault(filtered);
    },
    [vault, sortType, sortDirection],
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

  const refetchVault = useCallback(() => {
    // Refetch if havent recently or over 5 minutes
    if (
      refetchDate === null ||
      new Date().getTime() - refetchDate.getTime() > 60_000
    ) {
      setRefetchDate(new Date());
      fetchVaultMeta();
      setCanRefresh(false);

      // Set timer to allow refresh
      setTimeout(() => {
        setCanRefresh(true);
      }, 60_000);
    }
  }, [refetchDate]);

  useEffect(() => {
    searchVault(searchTerm);
  }, [searchTerm, sortDirection, sortType]);

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
        vaultMeta,
        vault,
        filteredVault,
        setSearchTerm,
        searchVault,
        searchTerm,
        sortVault,
        sortDirection,
        sortType,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
