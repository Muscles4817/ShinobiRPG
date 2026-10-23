import { useEffect, useState } from 'react';

import { reducedMotion } from './reducedMotion';

/**
 * A stat ticking up within its grade: when the sheet shows a value higher than the last time it
 * was shown (this session), the number rolls up from the old value and the bar gets a quick ink
 * stroke over the new stretch. Under reduced motion the number simply shows its new value.
 */

/** How long the number takes to roll up. */
const ROLL_MS = 700;

/** The value each stat was last shown at, by key, so a later visit can show what grew. */
const lastShown = new Map<string, number>();

export interface Tick {
  /** The number to show now (rolling up while the tick plays). */
  readonly shown: number;
  /** The value before the tick, while one plays; null when nothing grew. */
  readonly from: number | null;
}

/** Rolls `value` up from the value last shown under `key`. */
export function useTick(key: string, value: number): Tick {
  const [from] = useState(() => {
    const before = lastShown.get(key);
    const animated = !reducedMotion() && typeof requestAnimationFrame === 'function';
    return animated && before !== undefined && before < value ? before : null;
  });
  // How far the roll has got, 0–1.
  const [rolled, setRolled] = useState(0);

  useEffect(() => {
    lastShown.set(key, value);
  }, [key, value]);

  useEffect(() => {
    if (from === null) return undefined;
    let frame = 0;
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / ROLL_MS);
      setRolled(t);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [from]);

  const eased = 1 - (1 - rolled) ** 3;
  return { shown: from === null ? value : from + (value - from) * eased, from };
}
