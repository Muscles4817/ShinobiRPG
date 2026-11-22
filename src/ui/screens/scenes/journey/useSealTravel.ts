import { useEffect, useState } from 'react';

import { reducedMotion } from '../../../components/reducedMotion';

/**
 * The seal walking the road: when the journey's seal moves on, the shown share runs from where
 * it stood to where it stands now, quick for a short stretch and longer for a long one. A tap
 * skips to the end; under reduced motion, or with animations off, it simply stands there.
 *
 * The walk starts on the very render the seal moves on (noticed while rendering, not in an
 * effect), so what waits for the seal to arrive never shows, even for a frame, before it walks.
 */

/** How long walking the whole road would take; a stretch takes its share of it. */
const WHOLE_ROAD_MS = 4200;
const SHORTEST_MS = 900;
const LONGEST_MS = 2800;

/** A stretch being walked: from one share of the road to another. */
interface Walk {
  readonly from: number;
  readonly to: number;
}

export interface SealTravel {
  /** The share of the road to show the seal at now. */
  readonly shown: number;
  readonly moving: boolean;
  readonly skip: () => void;
}

const eased = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function canAnimate(animate: boolean): boolean {
  return animate && !reducedMotion() && typeof requestAnimationFrame === 'function';
}

export function useSealTravel(target: number, animate: boolean): SealTravel {
  const [stood, setStood] = useState(target);
  const [walk, setWalk] = useState<Walk | null>(null);
  /** How far the walk has got, 0–1. */
  const [t, setT] = useState(1);

  // Adjusting state while rendering (React's pattern for "state from changed props"): React
  // renders again at once, before anything is painted, so the walk is under way from the start.
  if (stood !== target) {
    setStood(target);
    setWalk(canAnimate(animate) ? { from: stood, to: target } : null);
    setT(0);
  }

  useEffect(() => {
    if (!walk) return undefined;
    const ms = Math.min(
      LONGEST_MS,
      Math.max(SHORTEST_MS, Math.abs(walk.to - walk.from) * WHOLE_ROAD_MS),
    );
    let start: number | null = null;
    let frame = 0;
    const step = (now: number) => {
      start ??= now;
      const done = Math.min(1, (now - start) / ms);
      setT(done);
      if (done < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [walk]);

  const walking = walk !== null && walk.to === target && t < 1;
  return {
    shown: walking ? walk.from + (walk.to - walk.from) * eased(t) : target,
    moving: walking,
    skip: () => {
      setWalk(null);
    },
  };
}
