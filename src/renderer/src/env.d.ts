/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_SOCKET_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
