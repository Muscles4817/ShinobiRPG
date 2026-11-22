import type { ReactNode } from 'react';

import { KeyLayer } from '../layout/KeyLayer';

interface SheetBackdropProps {
  /** A tap on the backdrop, or Esc while the sheet is on top, closes it. */
  readonly onClose: () => void;
  /** The sheet itself, which stops its own taps reaching the backdrop. */
  readonly children: ReactNode;
}

/**
 * The backdrop every sheet (a person, your companion, a notice, the stove, the fight guide) is
 * laid over the page with: a key layer of its own, so nothing under it hears a key while it is
 * open, and Esc or a tap outside closes it.
 */
export function SheetBackdrop({ onClose, children }: SheetBackdropProps) {
  return (
    <KeyLayer onEscape={onClose}>
      <div className="sheet-backdrop" onClick={onClose}>
        {children}
      </div>
    </KeyLayer>
  );
}
