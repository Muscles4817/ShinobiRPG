import type { PendingWrites } from './cachedStores';
import { holdCloseForWrites, type ClosingPage } from './keepWrites';

/** A window stand-in that remembers its close listener. */
function page() {
  let listener: ((event: Event) => void) | null = null;
  const closed = vi.fn();
  const stub: ClosingPage = {
    addEventListener: (_type, l) => {
      listener = l;
    },
    close: closed,
  };
  const leave = () => {
    const event = new Event('beforeunload', { cancelable: true });
    listener?.(event);
    return event;
  };
  return { stub, closed, leave };
}

function writes(busy: boolean, flushed: () => Promise<void>): PendingWrites {
  return { busy: () => busy, flushed };
}

describe('keeping the desktop app’s last save as its window closes', () => {
  it('holds a close until the save is written, then closes', async () => {
    const { stub, closed, leave } = page();
    holdCloseForWrites(
      writes(true, () => Promise.resolve()),
      stub,
    );
    expect(leave().defaultPrevented).toBe(true);
    await vi.waitFor(() => {
      expect(closed).toHaveBeenCalledTimes(1);
    });
  });

  it('lets a close go at once when nothing is waiting', () => {
    const { stub, closed, leave } = page();
    holdCloseForWrites(
      writes(false, () => Promise.resolve()),
      stub,
    );
    expect(leave().defaultPrevented).toBe(false);
    expect(closed).not.toHaveBeenCalled();
  });

  it('closes anyway once the limit passes, so a hung write never keeps the window open', () => {
    vi.useFakeTimers();
    const { stub, closed, leave } = page();
    holdCloseForWrites(
      writes(true, () => new Promise(() => undefined)),
      stub,
      100,
    );
    expect(leave().defaultPrevented).toBe(true);
    // A second close while one is held waits with it, and closes only once.
    expect(leave().defaultPrevented).toBe(true);
    return vi.advanceTimersByTimeAsync(100).then(() => {
      expect(closed).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });
});
