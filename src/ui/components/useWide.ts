import { useEffect, useState } from 'react';

/**
 * Whether the screen is wide enough for a desktop layout (panels side by side rather than one
 * page at a time). Follows the window as it is resized; without `matchMedia` (tests), narrow.
 */

const WIDE_QUERY = '(min-width: 960px)';

function query(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(WIDE_QUERY) : null;
}

export function useWide(): boolean {
  const [wide, setWide] = useState(() => query()?.matches ?? false);
  useEffect(() => {
    const list = query();
    if (!list) return;
    const follow = () => {
      setWide(list.matches);
    };
    list.addEventListener('change', follow);
    return () => {
      list.removeEventListener('change', follow);
    };
  }, []);
  return wide;
}
