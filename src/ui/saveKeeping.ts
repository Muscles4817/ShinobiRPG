import {
  contextForPack,
  deserialize,
  savedVersion,
  SAVE_VERSION,
  type GameContext,
  type GameState,
  type SaveStore,
} from '@/game';

import { saveSafely } from './saveSafely';

/**
 * Reading a save without ever taking the app down, and keeping a copy of any save about to be
 * lost: one that couldn't be read, one written by an older version (as it was before this
 * version changed it), and one a new game or a loaded save replaces. One copy is kept, the
 * latest; the Settings page copies it out or brings it back.
 */

export interface Loaded {
  readonly game: GameState;
  readonly ctx: GameContext;
}

export type ReadSave =
  { readonly ok: true; readonly loaded: Loaded } | { readonly ok: false; readonly error: string };

/** The save's game and its world, or why it can't be played. Never throws. */
export function readSave(raw: string): ReadSave {
  try {
    const loaded = deserialize(raw);
    if (!loaded.ok) return { ok: false, error: loaded.error };
    const ctx = contextForPack(loaded.value.packId, loaded.value.edits);
    if (ctx) return { ok: true, loaded: { game: loaded.value, ctx } };
    const world = loaded.value.packId;
    return {
      ok: false,
      error: `it uses the "${world}" world, which this version doesn’t include.`,
    };
  } catch {
    return { ok: false, error: 'something in it isn’t as this version expects.' };
  }
}

/** What became of a copy asked to be kept: kept, an earlier copy kept instead, or nothing. */
export type CopyKept = 'kept' | 'earlier-kept' | 'not-kept';

/**
 * Keeps `raw` as the device's kept copy, and says what was kept. Text that isn't a save file
 * at all (a file cut short, say) never takes the place of a copy already kept, which is more
 * likely the better one.
 */
export function keepCopy(rescue: SaveStore, raw: string): CopyKept {
  if (savedVersion(raw) === null && rescue.load() !== null) return 'earlier-kept';
  return saveSafely(rescue, raw) ? 'kept' : 'not-kept';
}

/** What the player is told about the copy, after "Your save could not be loaded: …". */
export const COPY_NOTICE: Readonly<Record<CopyKept, string>> = {
  kept: 'A copy of it is kept on this device (Settings, Save data), and a new game won’t erase it.',
  'earlier-kept':
    'It isn’t a whole save, so the copy kept earlier stays in its place (Settings, Save data), and a new game won’t erase that.',
  'not-kept':
    'This device couldn’t keep a copy of it, so starting a new game will replace it for good.',
};

/** Whether this save was written by an older version, so loading it will change it. */
export function fromOlderVersion(raw: string): boolean {
  const version = savedVersion(raw);
  return version !== null && version < SAVE_VERSION;
}
