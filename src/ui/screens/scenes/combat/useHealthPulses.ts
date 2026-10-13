import { useState } from 'react';

import type { CombatantView } from '@/game';

/**
 * Which fighters' health just moved, so their bar can flash: red for a hit, green for healing.
 * Each change counts up `n`, which the bar uses as its key, so a second hit in a row flashes
 * again. Presentation only: the numbers come from the view, this just notices them change.
 */

export interface HealthPulse {
  readonly kind: 'hurt' | 'healed';
  readonly n: number;
}

interface Tracked {
  /** Health as last seen, by fighter id. */
  readonly health: Readonly<Record<string, number>>;
  readonly pulses: Readonly<Record<string, HealthPulse>>;
}

const NOTHING_YET: Tracked = { health: {}, pulses: {} };

/** What changed since `seen`, or null when nothing did (so the screen settles). */
function noticed(seen: Tracked, fighters: readonly CombatantView[]): Tracked | null {
  const moved = fighters.filter((f) => seen.health[f.id] !== f.health);
  if (moved.length === 0) return null;
  const pulses = { ...seen.pulses };
  for (const f of moved) {
    const was = seen.health[f.id];
    if (was === undefined) continue;
    pulses[f.id] = { kind: f.health < was ? 'hurt' : 'healed', n: (pulses[f.id]?.n ?? 0) + 1 };
  }
  const health = { ...seen.health, ...Object.fromEntries(moved.map((f) => [f.id, f.health])) };
  return { health, pulses };
}

const NO_FIGHTERS: readonly CombatantView[] = [];

/** `fighters` is undefined when there is no fight to show. */
export function useHealthPulses(
  fighters: readonly CombatantView[] = NO_FIGHTERS,
): Readonly<Record<string, HealthPulse>> {
  const [seen, setSeen] = useState<Tracked>(NOTHING_YET);
  // Adjusting state while rendering (React's pattern for "state from changed props"): it
  // settles in one extra render, since the next pass sees nothing new.
  const next = noticed(seen, fighters);
  if (next) setSeen(next);
  return (next ?? seen).pulses;
}
