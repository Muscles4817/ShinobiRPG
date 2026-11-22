import type { PendingWrites } from './cachedStores';
import { keepWritesOnLeave, type LeavingPage } from './keepWrites';

/** A page that remembers its listeners, so a test can fire them. */
function page(visibility = 'visible') {
  const listeners: Record<string, (event: Event) => void> = {};
  const closed = vi.fn();
  const doc = { visibilityState: visibility };
  const stub: LeavingPage = {
    addEventListener: (type, listener) => {
      listeners[type] = listener;
    },
    close: closed,
    document: doc,
  };
  return { stub, listeners, closed, doc };
}

function writes(busy: boolean): PendingWrites & { readonly flushed: ReturnType<typeof vi.fn> } {
  return { busy: () => busy, flushed: vi.fn(() => Promise.resolve()) };
}

describe('keeping the last saves as the app goes away', () => {
  it('hurries pending writes on when the page is hidden or put away', () => {
    const { stub, listeners, doc } = page();
    const pending = writes(true);
    keepWritesOnLeave(pending, stub, { holdClose: false });
    listeners.pagehide?.(new Event('pagehide'));
    doc.visibilityState = 'hidden';
    listeners.visibilitychange?.(new Event('visibilitychange'));
    expect(pending.flushed).toHaveBeenCalledTimes(2);
  });

  it('in the desktop app, holds a close until the save is written, then closes', async () => {
    const { stub, listeners, closed } = page();
    keepWritesOnLeave(writes(true), stub, { holdClose: true });
    const leaving = new Event('beforeunload', { cancelable: true });
    listeners.beforeunload?.(leaving);
    expect(leaving.defaultPrevented).toBe(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(closed).toHaveBeenCalled();
  });

  it('lets a close go at once when nothing is waiting, and never holds one in a browser', () => {
    const idle = page();
    keepWritesOnLeave(writes(false), idle.stub, { holdClose: true });
    const leaving = new Event('beforeunload', { cancelable: true });
    idle.listeners.beforeunload?.(leaving);
    expect(leaving.defaultPrevented).toBe(false);
    const browser = page();
    keepWritesOnLeave(writes(true), browser.stub, { holdClose: false });
    expect(browser.listeners.beforeunload).toBeUndefined();
  });
});
