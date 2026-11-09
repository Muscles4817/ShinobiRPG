import type { SaveStore } from '@/game';

import type { SlotName, StorageBackend } from './storageBackend';

/**
 * The game's stores in front of a native backend. Everything is read once at boot, so `load` is
 * instant and the game stays synchronous; each `save` is kept in memory at once and written to
 * the backend behind it, one write per slot at a time, the newest data winning (saves made while
 * a write is under way collapse into one). A write that fails is reported by the next `save` to
 * that slot, which throws as a full browser storage does, so the game shows its notice.
 */

export type Stores = Readonly<Record<SlotName, SaveStore>>;

/** A store whose writes can be waited on: for tests, and for closing the app cleanly. */
export interface CachedStore extends SaveStore {
  /** Settles once every write asked for so far has been tried. */
  readonly flushed: () => Promise<void>;
}

export interface CachedStores {
  readonly stores: Stores;
  readonly flushed: () => Promise<void>;
}

/** Queued in place of data: the slot is to be emptied, after any write under way. */
const REMOVE = Symbol('remove');

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function cachedStore(
  backend: StorageBackend,
  slot: SlotName,
  initial: string | null,
): CachedStore {
  let cached = initial;
  // What the backend should hold next: data, `REMOVE`, or nothing waiting.
  let pending: string | typeof REMOVE | null = null;
  let failed: Error | null = null;
  let writing = false;
  let idle: Promise<void> = Promise.resolve();

  // Writes what is pending, then anything saved while it wrote, until nothing is left.
  const drain = async () => {
    while (pending !== null) {
      const next = pending;
      pending = null;
      try {
        await (next === REMOVE ? backend.remove(slot) : backend.write(slot, next));
        failed = null;
      } catch (error) {
        failed = asError(error);
      }
    }
  };
  const run = () => {
    writing = true;
    idle = drain().finally(() => {
      writing = false;
      if (pending !== null) run();
    });
  };

  return {
    load: () => cached,
    save: (data) => {
      const lastFailure = failed;
      cached = data;
      pending = data;
      if (!writing) run();
      if (lastFailure) throw lastFailure;
    },
    clear: () => {
      cached = null;
      pending = REMOVE;
      if (!writing) run();
    },
    flushed: async () => {
      while (writing) await idle;
    },
  };
}

/** Reads every slot from the backend, then hands the game stores that keep it written. */
export async function openCachedStores(backend: StorageBackend): Promise<CachedStores> {
  const [save, prefs, edits] = await Promise.all([
    backend.read('save'),
    backend.read('prefs'),
    backend.read('edits'),
  ]);
  const stores = {
    save: cachedStore(backend, 'save', save),
    prefs: cachedStore(backend, 'prefs', prefs),
    edits: cachedStore(backend, 'edits', edits),
  };
  const flushed = async () => {
    await Promise.all([stores.save.flushed(), stores.prefs.flushed(), stores.edits.flushed()]);
  };
  return { stores, flushed };
}
