import { useSyncExternalStore } from 'react';

/**
 * Whether the screen is wide enough for the desktop layout (the side rail, the main column and
 * the you panel). This query is the one place the breakpoint lives: the wide styles hang off the
 * `.app.wide` class it sets, never a media query of their own, so the two can't drift apart.
 */

/** The narrowest window the three-pane layout fits without squeezing the main column. */
const WIDE_QUERY = '(min-width: 1100px)';

function wideQuery(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(WIDE_QUERY) : null;
}

function subscribe(onChange: () => void): () => void {
  const query = wideQuery();
  query?.addEventListener('change', onChange);
  return () => {
    query?.removeEventListener('change', onChange);
  };
}

function isWide(): boolean {
  return wideQuery()?.matches ?? false;
}

/** True while the window is desktop-wide; follows the window as it is resized. */
export function useWideScreen(): boolean {
  return useSyncExternalStore(subscribe, isWide, () => false);
}
