/**
 * The slots the page may name, and the channels it names them on. The page never names a path:
 * the main process maps a slot to its file, and anything else is refused. The slots match the
 * game's own (`src/platform/storageBackend.ts`), which a test checks.
 */

export const SLOTS = ['save', 'prefs', 'edits'] as const;
export type Slot = (typeof SLOTS)[number];

/** The IPC channels the preload calls. Repeated in `preload.cts`, which can't import. */
export const CHANNELS = {
  read: 'shinobi:read',
  write: 'shinobi:write',
  remove: 'shinobi:remove',
} as const;

/** Far above any real save; a page sending more is broken or hostile. */
export const MAX_SLOT_BYTES = 64 * 1024 * 1024;

export function isSlot(value: unknown): value is Slot {
  return SLOTS.some((slot) => slot === value);
}

/** The slot a page asked for, or an error: a page never chooses a file. */
export function slotFrom(value: unknown): Slot {
  if (!isSlot(value)) throw new Error('Unknown slot.');
  return value;
}

/** What a page asked to write, or an error if it isn't text of a sane size. */
export function slotDataFrom(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Slot data must be text.');
  if (Buffer.byteLength(value, 'utf8') > MAX_SLOT_BYTES) throw new Error('Slot data too large.');
  return value;
}
