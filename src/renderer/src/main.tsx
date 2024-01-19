import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
// import { SocketIOProvider } from './providers/socketio';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="civitai-theme">
      {/* <SocketIOProvider> */}
      <App />
      {/* </SocketIOProvider> */}
    </ThemeProvider>
  </React.StrictMode>,
);
