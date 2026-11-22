import { useCallback, useState } from 'react';

import type { CombatantView } from '@/game';

/**
 * Where watching a staged fight stands. The stage is set by what the fight's story holds, never by
 * what you pressed: lines you haven't watched are staged from where you left off as soon as they
 * exist, and the stage holds once they have played until you go back to plan. A step still being
 * played (off the page's thread) has no lines yet, so nothing is staged, held or let go for it,
 * and its round can't be skipped before it arrives.
 */

export interface Watching {
  /** The story event the beats on the stage start at (`storyEnd` places). */
  readonly from: number;
  /** How far into the story you have watched. */
  readonly seen: number;
  /** The stage stays up after its beats until you go back to plan. */
  readonly holding: boolean;
  /** Everyone as they stood when you last played on, for the gauges and the first beat. */
  readonly before: readonly CombatantView[] | null;
}

/** Watching from the end of a story of `length` events, with nothing on the stage. */
function caughtUp(length: number): Watching {
  return { from: length, seen: length, holding: false, before: null };
}

/**
 * Where watching should stand for a story of `length` events, or null when it already does. Turn by
 * turn (`staged` false) the log is the screen, so it keeps up and a finished fight stages only
 * its end. Staged, lines not yet watched are put on the stage from where you left off, and held.
 * A log shorter than what was watched is another fight's: start over at its end.
 */
export function nextWatching(watch: Watching, length: number, staged: boolean): Watching | null {
  if (length < watch.seen) return caughtUp(length);
  if (!staged) return watch.from === length && watch.seen === length ? null : caughtUp(length);
  if (length === watch.seen) return null;
  if (watch.from === watch.seen && watch.holding) return null;
  return { ...watch, from: watch.seen, holding: true };
}

export function useWatching(length: number, staged: boolean) {
  const [watch, setWatch] = useState<Watching>(() => caughtUp(length));
  // Adjusting state while rendering (React's pattern for "state from changed props"): React
  // renders again at once, before anything is painted, so new lines are never shown unstaged.
  const next = nextWatching(watch, length, staged);
  if (next) setWatch(next);
  /** You play on: everyone as they stand now is how the stage begins. */
  const playOn = useCallback((before: readonly CombatantView[]) => {
    setWatch((w) => ({ ...w, before }));
  }, []);
  /** The last beat on the stage has played (or been skipped to). */
  const watched = useCallback(() => {
    setWatch((w) => (w.seen === length ? w : { ...w, seen: length }));
  }, [length]);
  /** Back to the card table. */
  const plan = useCallback(() => {
    setWatch((w) => ({ ...w, holding: false }));
  }, []);
  return { watch: next ?? watch, playOn, watched, plan };
}
