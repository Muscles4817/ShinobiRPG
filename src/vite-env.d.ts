/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to "true" for public release builds to leave fan-made content packs out. */
  readonly VITE_EXCLUDE_FAN_PACKS?: string;
}
