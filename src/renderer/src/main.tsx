import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
import { ElectronProvider } from './providers/electron';
import { Toaster } from './components/ui/toaster';
import { FileProvider } from './providers/files';
import { VaultProvider } from './providers/vault';
import { Routes, Route, HashRouter, Navigate } from 'react-router-dom';
import { Files } from './routes/files';
import { File } from './routes/files/file';
import { Vault } from './routes/vault';
import { Activities } from './routes/activities';
import { Settings } from './routes/settings';
import { FileNotSelected } from './routes/files/file-not-selected';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ModelLoadingProvider } from './providers/model-loading';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider defaultTheme="system" storageKey="civitai-theme">
    <ElectronProvider>
      <ModelLoadingProvider>
        <FileProvider>
          <VaultProvider>
            <TooltipProvider delayDuration={0}>
              <HashRouter basename="/">
                <Routes>
                  <Route path="/" element={<App />}>
                    <Route index element={<Navigate to="/files" replace />} />
                    <Route path="/files" element={<Files />}>
                      <Route index element={<FileNotSelected />} />
                      <Route path="/files/:hash" element={<File />} />
                    </Route>
                    <Route path="/vault" element={<Vault />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Routes>
              </HashRouter>
            </TooltipProvider>
          </VaultProvider>
        </FileProvider>
      </ModelLoadingProvider>
    </ElectronProvider>
    <Toaster />
  </ThemeProvider>,
);
