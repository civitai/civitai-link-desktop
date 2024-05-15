import { createContext, useContext, useEffect, useState } from 'react';

type ModelLoadingContextType = {
  toScan: number;
  scanned: number;
  isScanning: boolean;
};

const defaultValue: ModelLoadingContextType = {
  toScan: 0,
  scanned: 0,
  isScanning: false,
};

const ModelLoadingContext =
  createContext<ModelLoadingContextType>(defaultValue);
export const useModelLoading = () => useContext(ModelLoadingContext);

export function ModelLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const ipcRenderer = window.electron.ipcRenderer;
  const [data, setData] = useState<ModelLoadingContextType>({
    ...defaultValue,
  });

  useEffect(() => {
    ipcRenderer.on(
      'model-loading',
      function (_, { toScan, scanned, isScanning }) {
        setData({
          toScan,
          scanned,
          isScanning,
        });
      },
    );

    return () => {
      ipcRenderer.removeAllListeners('model-loading');
    };
  });

  return (
    <ModelLoadingContext.Provider
      value={{
        ...data,
      }}
    >
      {children}
    </ModelLoadingContext.Provider>
  );
}
