/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly MAPTILER_API_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
