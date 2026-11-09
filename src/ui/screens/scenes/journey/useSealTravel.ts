import { useEffect, useRef, useState } from 'react';

import { reducedMotion } from '../../../components/reducedMotion';

/**
 * The seal walking the road: when the journey's seal moves on, the shown share runs from where
 * it stood to where it stands now, quick for a short stretch and longer for a long one. A tap
 * skips to the end; under reduced motion, or with animations off, it simply stands there.
 */

/** How long walking the whole road would take; a stretch takes its share of it. */
const WHOLE_ROAD_MS = 4200;
const SHORTEST_MS = 900;
const LONGEST_MS = 2800;

interface Walk {
  readonly from: number;
  readonly to: number;
  /** How far the walk has got, 0–1. */
  readonly t: number;
}

export interface SealTravel {
  /** The share of the road to show the seal at now. */
  readonly shown: number;
  readonly moving: boolean;
  readonly skip: () => void;
}

const eased = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function useSealTravel(target: number, animate: boolean): SealTravel {
  const [walk, setWalk] = useState<Walk | null>(null);
  const before = useRef(target);
  const frame = useRef(0);

  useEffect(() => {
    const from = before.current;
    before.current = target;
    const able = animate && !reducedMotion() && typeof requestAnimationFrame === 'function';
    if (!able || from === target) return undefined;
    const ms = Math.min(LONGEST_MS, Math.max(SHORTEST_MS, Math.abs(target - from) * WHOLE_ROAD_MS));
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / ms);
      setWalk({ from, to: target, t });
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [target, animate]);

  const walking = walk !== null && walk.to === target && walk.t < 1;
  return {
    shown: walking ? walk.from + (walk.to - walk.from) * eased(walk.t) : target,
    moving: walking,
    skip: () => {
      cancelAnimationFrame(frame.current);
      setWalk(null);
    },
  };
}
