import { createContext, useContext, useEffect, useState } from 'react';

type ModelLoadingContextType = {
  totalModels: number;
  loadedModels: number;
  isLoading: boolean;
};

const defaultValue: ModelLoadingContextType = {
  totalModels: 0,
  loadedModels: 0,
  isLoading: false,
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
      function (_, { totalModels, loadedModels, isLoading }) {
        setData({
          totalModels: totalModels,
          loadedModels: loadedModels,
          isLoading: isLoading,
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
