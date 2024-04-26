import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useApi } from '@/hooks/use-api';
import { set } from 'lodash';
// import {
//   SortType,
//   SortDirection,
//   reduceFileMap,
//   sortModelName,
//   sortDownloadDate,
//   sortFileSize,
// } from '@/lib/search-filter';

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
  searchFiles: (search: string) => void;
  searchTerm: string;
};

const defaultValue: VaultContextType = {
  refetchVault: () => {},
  canRefresh: true,
  vaultMeta: null,
  vault: [],
  filteredVault: [],
  setSearchTerm: () => {},
  searchFiles: () => {},
  searchTerm: '',
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
  // const [sortDirection, setSortDirection] = useState<SortDirection>(
  //   SortDirection.DESC,
  // );
  // const [sortType, setSortType] = useState<SortType>(SortType.DOWNLOAD_DATE);

  const searchFiles = useCallback(
    (search: string) => {
      const filtered = vault.filter((file) => {
        if (search === '') {
          return true;
        }

        return file.modelName?.toLowerCase().includes(search.toLowerCase());
      });

      setFilteredVault(filtered);
    },
    [vault],
  );

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
        searchFiles,
        searchTerm,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
