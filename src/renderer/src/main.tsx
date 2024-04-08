import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
import { ElectronProvider } from './providers/electron';
import { Toaster } from './components/ui/toaster';
import { FileProvider } from './providers/files';
import { VaultProvider } from './providers/vault';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Files } from './routes/files/files';
import { File } from './routes/files/file';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider defaultTheme="system" storageKey="civitai-theme">
    <ElectronProvider>
      <FileProvider>
        <VaultProvider>
          <BrowserRouter basename="/">
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Files />} />
                <Route path="/files" element={<Files />}>
                  <Route path="/files/:fileId" element={<File />} />
                </Route>
                <Route path="/vault" element={<Files />} />
                <Route path="/activities" element={<Files />} />
                <Route path="/settings" element={<Files />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </VaultProvider>
      </FileProvider>
    </ElectronProvider>
    <Toaster />
  </ThemeProvider>,
);
