import { useState } from 'react';

import { useWideScreen } from './useWideScreen';

/**
 * On the desktop layout, pointing at something (or tabbing to it) previews it in the panel
 * beside it, and leaving it goes back to what was picked. A click still picks. On a phone
 * nothing is attached: a tap there is a pick.
 */

export interface HoverHandlers {
  readonly onMouseEnter?: () => void;
  readonly onMouseLeave?: () => void;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
}

export interface HoverPreview {
  /** What is being pointed at now, or null. */
  readonly previewId: string | null;
  /** The handlers to spread on the item with this id. */
  readonly handlersFor: (id: string) => HoverHandlers;
}

const NONE: HoverHandlers = {};

export function useHoverPreview(): HoverPreview {
  const wide = useWideScreen();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const leave = () => {
    setPreviewId(null);
  };
  const handlersFor = (id: string): HoverHandlers => {
    if (!wide) return NONE;
    const enter = () => {
      setPreviewId(id);
    };
    return { onMouseEnter: enter, onMouseLeave: leave, onFocus: enter, onBlur: leave };
  };
  return { previewId: wide ? previewId : null, handlersFor };
}
