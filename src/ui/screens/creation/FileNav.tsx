import { useEffect, useMemo } from 'react';

import { useKeys } from '../../layout/useKeys';

/**
 * The foot of the academy file: why the page can't be turned yet, Back and the page's own
 * forward button, and how far through the file you are. On a desk Enter turns the page (or
 * graduates, on the last) and Esc goes back; Enter on an option just picked turns the page too,
 * since the option is already chosen and pressing it again would change nothing.
 */

/** Whether the focused control is an option already picked: Enter there means "on". */
function onPickedOption(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.getAttribute('aria-pressed') === 'true';
}

/** Enter on a picked option turns the page (`useKeys` leaves a focused control alone). */
function usePickedEnter(enabled: boolean, onForward: () => void): void {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.ctrlKey || event.metaKey || event.altKey) return;
      if (!onPickedOption(event.target)) return;
      event.preventDefault();
      onForward();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled, onForward]);
}

interface FileNavProps {
  readonly blocker: string | null;
  readonly index: number;
  readonly pages: number;
  /** The forward button's words: "Turn the page", "Find your file", the graduation line. */
  readonly forward: string;
  readonly canForward: boolean;
  readonly onForward: () => void;
  readonly onBack: () => void;
  readonly wide: boolean;
}

export function FileNav({
  blocker,
  index,
  pages,
  forward,
  canForward,
  onForward,
  onBack,
  wide,
}: FileNavProps) {
  const bindings = useMemo(
    () => ({
      Enter: canForward ? onForward : undefined,
      Escape: index > 0 ? onBack : undefined,
    }),
    [canForward, onForward, onBack, index],
  );
  useKeys(bindings, wide);
  usePickedEnter(wide && canForward, onForward);
  return (
    <nav className="file-nav" aria-label="Turn the file’s pages">
      {blocker && <p className="blocker">{blocker}</p>}
      <div className="row-buttons">
        <button type="button" className="btn ghost" disabled={index === 0} onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn" disabled={!canForward} onClick={onForward}>
          {forward}
        </button>
      </div>
      <p className="file-progress num">
        Page {index + 1} of {pages}
        {wide && <span className="key-note"> Enter turns the page, Esc goes back.</span>}
      </p>
    </nav>
  );
}
