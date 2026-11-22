import { useState } from 'react';

import type { CombatantView } from '@/game';

/**
 * Where watching a staged fight stands. The stage is set by what the fight's log holds, never by
 * what you pressed: lines you haven't watched are staged from where you left off as soon as they
 * exist, and the stage holds once they have played until you go back to plan. A step still being
 * played (off the page's thread) has no lines yet, so nothing is staged, held or let go for it,
 * and its round can't be skipped before it arrives.
 */

export interface Watching {
  /** The log line the beats on the stage start at. */
  readonly from: number;
  /** How far into the log you have watched. */
  readonly seen: number;
  /** The stage stays up after its beats until you go back to plan. */
  readonly holding: boolean;
  /** Everyone as they stood when you last played on, for the gauges. */
  readonly before: readonly CombatantView[] | null;
}

/** New lines since you last watched, not yet on the stage: stage them, and hold it. */
export function stageNew(watch: Watching, length: number): Watching | null {
  if (length <= watch.seen) return null;
  if (watch.from === watch.seen && watch.holding) return null;
  return { ...watch, from: watch.seen, holding: true };
}

/** Turn by turn, the log is the screen: keep up, so a finished fight stages only its end. */
function keptUp(watch: Watching, length: number): Watching | null {
  return watch.from === length && watch.seen === length
    ? null
    : { from: length, seen: length, holding: false, before: null };
}

export function useWatching(length: number, staged: boolean) {
  const [watch, setWatch] = useState<Watching>(() => ({
    from: length,
    seen: length,
    holding: false,
    before: null,
  }));
  // Adjusting state while rendering (React's pattern for "state from changed props"): React
  // renders again at once, before anything is painted, so new lines are never shown unstaged.
  const next = staged ? stageNew(watch, length) : keptUp(watch, length);
  if (next) setWatch(next);
  return {
    watch: next ?? watch,
    /** You play on: everyone as they stand now is how the stage begins. */
    playOn: (before: readonly CombatantView[]) => {
      setWatch((w) => ({ ...w, before }));
    },
    /** The last beat on the stage has played (or been skipped to). */
    watched: () => {
      setWatch((w) => (w.seen === length ? w : { ...w, seen: length }));
    },
    /** Back to the card table. */
    plan: () => {
      setWatch((w) => ({ ...w, holding: false }));
    },
  };
}
