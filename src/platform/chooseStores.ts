import { openCachedStores, type PendingWrites, type Stores } from './cachedStores';
import { capacitorBackend } from './capacitorBackend';
import { ELECTRON_BACKEND } from './electronBackend';
import {
  createLocalEditsStore,
  createLocalPrefsStore,
  createLocalRescueStore,
  createLocalSaveStore,
} from './localSaveStore';
import type { NativeBackend } from './storageBackend';

/**
 * Picks where the game keeps its files: a native shell's files when the game runs inside one
 * (the desktop or phone app), else the browser's storage (the web build, for development and
 * the demo).
 */

/** Every shell the game knows how to run in. A shell adds its backend here. */
const NATIVE_BACKENDS: readonly NativeBackend[] = [ELECTRON_BACKEND, capacitorBackend];

export interface ChosenStores {
  readonly stores: Stores;
  /** Which shell's files are in use, or null in a browser. */
  readonly shell: string | null;
  /** A shell's writes behind the game, to be finished before the app closes; none in a browser. */
  readonly writes: PendingWrites | null;
}

function browserStores(): Stores {
  return {
    save: createLocalSaveStore(),
    prefs: createLocalPrefsStore(),
    edits: createLocalEditsStore(),
    rescue: createLocalRescueStore(),
  };
}

export async function chooseStores(
  backends: readonly NativeBackend[] = NATIVE_BACKENDS,
): Promise<ChosenStores> {
  for (const shell of backends) {
    const backend = shell.detect();
    if (!backend) continue;
    const opened = await openCachedStores(backend);
    return { stores: opened.stores, shell: shell.name, writes: opened };
  }
  return { stores: browserStores(), shell: null, writes: null };
}
