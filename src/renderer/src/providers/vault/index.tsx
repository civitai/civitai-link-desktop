import { createContext, useContext, useEffect, useState } from 'react';

type VaultMeta = {
  usedStorageKb: number;
  storageKb: number;
};

type VaultContextType = {
  vaultMeta: VaultMeta | null;
};

const defaultValue: VaultContextType = {
  vaultMeta: null,
};

const VaultContext = createContext<VaultContextType>(defaultValue);
export const useVault = () => useContext(VaultContext);

// TODO: Add/Remove toggle
// TODO: Download from vault (edge it wont exist in our API)
// TODO: Add actions to activity feed
// Probably need to set up link sockets around all of this
export function VaultProvider({ children }: { children: React.ReactNode }) {
  const ipcRenderer = window.electron.ipcRenderer;
  const [vaultMeta, setVaultMeta] = useState<VaultMeta | null>(null);

  useEffect(() => {
    ipcRenderer.on('vault-meta-update', function (_, message) {
      setVaultMeta(message);
    });

    return () => {
      ipcRenderer.removeAllListeners('vault-meta-update');
    };
  }, []);

  // Get initial store on load
  useEffect(() => {
    ipcRenderer.on('store-ready', function (_, message) {
      setVaultMeta(message.vaultMeta);
    });

    return () => {
      ipcRenderer.removeAllListeners('store-ready');
    };
  }, []);

  return (
    <VaultContext.Provider
      value={{
        vaultMeta,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
