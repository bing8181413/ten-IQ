/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
