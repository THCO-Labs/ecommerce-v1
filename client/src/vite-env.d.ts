/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin for deployed builds. Unset in development, where Vite proxies `/api`. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
