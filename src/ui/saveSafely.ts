import type { SaveStore } from '@/game';

/**
 * Writes to a store without letting a failed write stop the game. Browser storage has a quota
 * per site, and the desktop and phone apps write files that can fail too; the game plays on,
 * and the caller tells the player their progress isn't being kept. The notice is true wherever
 * the game runs.
 */

export const STORAGE_FULL =
  'Your progress isn’t being saved: the game couldn’t write its save on this device, most likely because there is no room left. Freeing some space (in a browser, clearing other data kept for this site) lets it save again on your next move.';

/** True if the data was kept. */
export function saveSafely(store: SaveStore, data: string): boolean {
  try {
    store.save(data);
    return true;
  } catch {
    return false;
  }
}
