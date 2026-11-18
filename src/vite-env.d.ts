/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to "true" for public release builds to leave fan-made content packs out. */
  readonly VITE_EXCLUDE_FAN_PACKS?: string;
}

/** The short commit hash the build was made from (`vite.config.ts`). */
declare const __BUILD_COMMIT__: string;
/** The day the build was made, as YYYY-MM-DD. */
declare const __BUILD_DATE__: string;
