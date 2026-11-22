// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';

import { useSealTravel } from './useSealTravel';

/** The seal's walk: under way from the render the seal moves on, so nothing waiting shows first. */

describe('the seal walking the road', () => {
  let frames: FrameRequestCallback[] = [];
  beforeEach(() => {
    frames = [];
    vi.stubGlobal('requestAnimationFrame', (run: FrameRequestCallback) => frames.push(run));
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const runFrame = (now: number) => {
    const due = frames;
    frames = [];
    act(() => {
      for (const run of due) run(now);
    });
  };

  it('is moving on the very render the seal moves on, before any frame has run', () => {
    const { result, rerender } = renderHook(({ to }) => useSealTravel(to, true), {
      initialProps: { to: 0.2 },
    });
    expect(result.current.moving).toBe(false);
    rerender({ to: 0.5 });
    expect(result.current).toMatchObject({ moving: true, shown: 0.2 });
    runFrame(0);
    runFrame(10_000);
    expect(result.current).toMatchObject({ moving: false, shown: 0.5 });
  });

  it('stands still with animations off, and stops at once when skipped', () => {
    const still = renderHook(({ to }) => useSealTravel(to, false), { initialProps: { to: 0 } });
    still.rerender({ to: 0.4 });
    expect(still.result.current).toMatchObject({ moving: false, shown: 0.4 });

    const { result, rerender } = renderHook(({ to }) => useSealTravel(to, true), {
      initialProps: { to: 0 },
    });
    rerender({ to: 0.4 });
    act(() => {
      result.current.skip();
    });
    expect(result.current).toMatchObject({ moving: false, shown: 0.4 });
  });
});
