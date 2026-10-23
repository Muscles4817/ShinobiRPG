import { openCachedStores, type Stores } from './cachedStores';
import { ELECTRON_BACKEND } from './electronBackend';
import {
  createLocalEditsStore,
  createLocalPrefsStore,
  createLocalSaveStore,
} from './localSaveStore';
import type { NativeBackend } from './storageBackend';

/**
 * Picks where the game keeps its files: a native shell's files when the game runs inside one
 * (the desktop or phone app), else the browser's storage (the web build, for development and
 * the demo).
 */

/** Every shell the game knows how to run in. A shell adds its backend here. */
const NATIVE_BACKENDS: readonly NativeBackend[] = [ELECTRON_BACKEND];

export interface ChosenStores {
  readonly stores: Stores;
  /** Which shell's files are in use, or null in a browser. */
  readonly shell: string | null;
}

function browserStores(): Stores {
  return {
    save: createLocalSaveStore(),
    prefs: createLocalPrefsStore(),
    edits: createLocalEditsStore(),
  };
}

export async function chooseStores(
  backends: readonly NativeBackend[] = NATIVE_BACKENDS,
): Promise<ChosenStores> {
  for (const shell of backends) {
    const backend = shell.detect();
    if (backend) return { stores: (await openCachedStores(backend)).stores, shell: shell.name };
  }
  return { stores: browserStores(), shell: null };
}
