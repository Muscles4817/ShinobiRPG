import { useId, useState, type PointerEvent } from 'react';

import { statusHelp } from '@/game';

/**
 * A fighter's statuses as words that explain themselves (`statusHelp`): tap one, or point at it
 * on a desktop, and its rule and what answers it open beneath the line; tap again, Esc or move
 * away to close. Each word is a button that names the explanation it opens, so a screen reader
 * hears the rule too. A word the glossary doesn't know stays plain text.
 */

interface StatusWordsProps {
  readonly statuses: readonly string[];
  /** Whose statuses, for the list's label. */
  readonly owner: string;
}

const fromMouse = (e: PointerEvent) => e.pointerType === 'mouse';

export function StatusWords({ statuses, owner }: StatusWordsProps) {
  const [tapped, setTapped] = useState<string | null>(null);
  const [pointed, setPointed] = useState<string | null>(null);
  const helpId = useId();
  if (statuses.length === 0) return null;
  const open = pointed ?? tapped;
  const help = open === null ? null : statusHelp(open);
  return (
    <div className="status-words">
      <ul className="status-list" aria-label={`${owner}: conditions`}>
        {statuses.map((s) =>
          statusHelp(s) ? (
            <li key={s}>
              <button
                type="button"
                className="status-word"
                aria-expanded={open === s}
                aria-controls={helpId}
                aria-describedby={open === s ? helpId : undefined}
                onClick={() => {
                  // A click pins the slip open, or shuts it even while pointed at.
                  setPointed(null);
                  setTapped(tapped === s ? null : s);
                }}
                onPointerEnter={(e) => {
                  if (fromMouse(e)) setPointed(s);
                }}
                onPointerLeave={(e) => {
                  if (fromMouse(e)) setPointed(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setTapped(null);
                }}
              >
                {s}
              </button>
            </li>
          ) : (
            <li key={s} className="status-plain">
              {s}
            </li>
          ),
        )}
      </ul>
      <p id={helpId} className="status-help" role="status" hidden={help === null}>
        {help && (
          <>
            <b>{open}.</b> {help.rule} <span className="status-answer">{help.counter}</span>
          </>
        )}
      </p>
    </div>
  );
}
