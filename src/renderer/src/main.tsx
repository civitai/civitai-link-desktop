import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
import { ElectronProvider } from './providers/electron';
import { Toaster } from './components/ui/toaster';
import { FileProvider } from './providers/files';
import { VaultProvider } from './providers/vault';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider defaultTheme="system" storageKey="civitai-theme">
    <ElectronProvider>
      <FileProvider>
        <VaultProvider>
          <App />
        </VaultProvider>
      </FileProvider>
    </ElectronProvider>
    <Toaster />
  </ThemeProvider>,
);
