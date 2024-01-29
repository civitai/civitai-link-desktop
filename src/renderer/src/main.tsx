import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
import { ElectronProvider } from './providers/electron';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="civitai-theme">
      <ElectronProvider>
        <App />
      </ElectronProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
