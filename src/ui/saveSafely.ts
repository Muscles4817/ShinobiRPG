import type { SaveStore } from '@/game';

/**
 * Writes to a store without letting a full one stop the game. Browser storage has a quota per
 * site (shared with anything else served from the same address), and a write past it throws;
 * the game plays on, and the caller tells the player their progress isn't being kept.
 */

export const STORAGE_FULL =
  'Your progress isn’t being saved: this browser’s storage for the game is full. Clearing other data kept for this site frees it, and the game saves again on your next move.';

/** True if the data was kept. */
export function saveSafely(store: SaveStore, data: string): boolean {
  try {
    store.save(data);
    return true;
  } catch {
    return false;
  }
}
