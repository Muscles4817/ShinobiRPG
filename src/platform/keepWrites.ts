import type { PendingWrites } from './cachedStores';

/**
 * Keeping the desktop app's last save when its window is closed. The game's stores write
 * behind it (`cachedStores.ts`): each save starts writing at once, but the newest may still be
 * on its way when the player closes the window. The window waits on `beforeunload`, so a close
 * that would cut a write short is held until the writes are done (or `HOLD_LIMIT_MS` has
 * passed, so a write that hangs can never keep the window open), then the window closes
 * itself. A browser would ask the player instead, so only a shell that closes quietly holds.
 */

/** The longest a close is held for writes still under way. */
export const HOLD_LIMIT_MS = 3000;

/** The parts of the page the keeper needs: the window, or a stand-in in tests. */
export interface ClosingPage {
  readonly addEventListener: (type: 'beforeunload', listener: (event: Event) => void) => void;
  readonly close: () => void;
}

/** Settles when the writes are done or the limit has passed, whichever comes first. */
function writtenOrTimedOut(writes: PendingWrites, limitMs: number): Promise<void> {
  return Promise.race([
    writes.flushed(),
    new Promise<void>((resolve) => {
      setTimeout(resolve, limitMs);
    }),
  ]);
}

export function holdCloseForWrites(
  writes: PendingWrites,
  page: ClosingPage,
  limitMs = HOLD_LIMIT_MS,
): void {
  let holding = false;
  page.addEventListener('beforeunload', (event) => {
    if (!holding && !writes.busy()) return;
    // Electron cancels the close quietly; the window closes once the save is written. A close
    // asked again while one is held waits with it.
    event.preventDefault();
    if (holding) return;
    holding = true;
    void writtenOrTimedOut(writes, limitMs).then(() => {
      holding = false;
      page.close();
    });
  });
}
