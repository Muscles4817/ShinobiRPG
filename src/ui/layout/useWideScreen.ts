import { useSyncExternalStore } from 'react';

/**
 * Whether the screen is wide enough for the desktop layout (the side rail, the main column and
 * the you panel). This query is the one place the breakpoint lives: the wide styles hang off the
 * `.app.wide` class it sets, never a media query of their own, so the two can't drift apart.
 * A roomy desk is one with space in the main column to set a list beside a full page.
 */

/** The narrowest window the three-pane layout fits without squeezing the main column. */
const WIDE_QUERY = '(min-width: 1100px)';
/** The narrowest window whose main column holds a list beside a person's page. */
const ROOMY_QUERY = '(min-width: 1300px)';

interface MediaStore {
  readonly subscribe: (onChange: () => void) => () => void;
  readonly matches: () => boolean;
}

function mediaStore(media: string): MediaStore {
  const query = (): MediaQueryList | null =>
    typeof window.matchMedia === 'function' ? window.matchMedia(media) : null;
  return {
    subscribe: (onChange) => {
      const list = query();
      list?.addEventListener('change', onChange);
      return () => {
        list?.removeEventListener('change', onChange);
      };
    },
    matches: () => query()?.matches ?? false,
  };
}

const WIDE = mediaStore(WIDE_QUERY);
const ROOMY = mediaStore(ROOMY_QUERY);

/** True while the window is desktop-wide; follows the window as it is resized. */
export function useWideScreen(): boolean {
  return useSyncExternalStore(WIDE.subscribe, WIDE.matches, () => false);
}

/** True while the window is desktop-wide with room to spare (see `ROOMY_QUERY`). */
export function useRoomyDesk(): boolean {
  const roomy = useSyncExternalStore(ROOMY.subscribe, ROOMY.matches, () => false);
  return useWideScreen() && roomy;
}
