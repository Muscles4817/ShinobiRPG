import type { PendingWrites } from './cachedStores';

/**
 * Keeping a native shell's last saves when the app goes away. The game's stores write behind
 * it (`cachedStores.ts`), so the newest save may still be waiting when the player closes the
 * window or the phone sends the app to the background. When the page is hidden or put away
 * the writes are hurried on; and where the shell lets the page hold a close (the desktop app,
 * whose window waits on `beforeunload`), a close that would cut a write short waits for it,
 * then closes the window itself.
 */

/** The parts of the page the keeper listens to: the window, or a stand-in in tests. */
export interface LeavingPage {
  readonly addEventListener: (type: string, listener: (event: Event) => void) => void;
  readonly close: () => void;
  readonly document: { readonly visibilityState: string };
}

export interface KeepOptions {
  /** Whether a close may be held until the writes are done (true only in the desktop app). */
  readonly holdClose: boolean;
}

export function keepWritesOnLeave(
  writes: PendingWrites,
  page: LeavingPage,
  { holdClose }: KeepOptions,
): void {
  const hurry = () => {
    void writes.flushed();
  };
  page.addEventListener('pagehide', hurry);
  page.addEventListener('visibilitychange', () => {
    if (page.document.visibilityState === 'hidden') hurry();
  });
  if (!holdClose) return;
  page.addEventListener('beforeunload', (event) => {
    if (!writes.busy()) return;
    // Electron cancels the close quietly; the window closes once the save is written.
    event.preventDefault();
    void writes.flushed().then(() => {
      page.close();
    });
  });
}
