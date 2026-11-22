import { useState } from 'react';

import { healthMoves, type CombatantView, type FightBeat } from '@/game';

/**
 * Which fighters' health just moved, so their bar can flash: red for a hit, green for healing.
 * Each change counts up `n`, which the bar uses as its key, so a second hit in a row flashes
 * again. Presentation only: the numbers come from the view. Between rounds and turn by turn the
 * view only ever moves on, so a change noticed is a change made (`useHealthPulses`); a replay
 * can step back, so its flashes come from the beat itself (`beatPulses`).
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

/**
 * The flashes of a beat on the watch screen: the health moves the beat itself made, flashed only
 * (the first against `before`, everyone as the beats began) when the beat was arrived at going on (`usePlayback`'s `arrival`, which keys each flash afresh),
 * never when it was reached going back or skipped to.
 */
export function beatPulses(
  beats: readonly FightBeat[],
  at: number,
  arrival: number | null,
  before: readonly CombatantView[] | null,
): Readonly<Record<string, HealthPulse>> {
  if (arrival === null) return {};
  const started = Object.fromEntries((before ?? []).map((f) => [f.id, f.health]));
  return Object.fromEntries(
    Object.entries(healthMoves(beats, at, started)).map(([id, kind]) => [id, { kind, n: arrival }]),
  );
}
