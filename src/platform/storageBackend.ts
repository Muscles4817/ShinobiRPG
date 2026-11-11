/**
 * Where a native shell (the desktop app, the phone app) keeps the game's files. Every native
 * file API is asynchronous, so this is too; `cachedStores` puts the game's synchronous
 * `SaveStore`s in front of it. A shell implements one of these and adds it to `NATIVE_BACKENDS`
 * in `chooseStores.ts`.
 */

/**
 * What the game keeps on a device: the save, its settings, the editor's changes, and `rescue`,
 * a copy of the last save that was replaced, brought up from an older version or couldn't be read.
 */
export const SLOTS = ['save', 'prefs', 'edits', 'rescue'] as const;
export type SlotName = (typeof SLOTS)[number];

export interface StorageBackend {
  /** What the slot holds, or null if nothing has been kept in it. */
  read(slot: SlotName): Promise<string | null>;
  /** Replaces what the slot holds. Should be atomic: a crash mid-write keeps the old file. */
  write(slot: SlotName, data: string): Promise<void>;
  remove(slot: SlotName): Promise<void>;
}

/** A shell's backend, offered only when the game is running inside that shell. */
export interface NativeBackend {
  readonly name: string;
  /** The backend if the game is running in this shell, else null. */
  readonly detect: () => StorageBackend | null;
}
