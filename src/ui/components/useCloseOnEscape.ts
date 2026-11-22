import { useEffect } from 'react';

import { useKeysLive } from '../layout/KeyLayer';

/**
 * Closes a sheet when Esc is pressed: the keyboard's way out of anything laid over the page,
 * unless something else has been laid over the sheet (`KeyLayer`), which Esc leaves alone.
 */
export function useCloseOnEscape(onClose: () => void): void {
  const live = useKeysLive();
  useEffect(() => {
    if (!live) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, live]);
}
