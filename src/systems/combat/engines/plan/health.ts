import type { CombatEvent, HealthCause } from '../../storyContract';
import type { PlanFighter, Round } from './state';

/**
 * The one writer of a fighter's health in a planned fight. Whatever moves it (a hit, a heal, a
 * blood price, a coward running, a clone popping, a body raised or put down) comes through here,
 * which sets it and records the change where it is made (`storyContract.ts`: who, to what, why,
 * and by whom), so the story says whose hit it was without anyone reading the words for it.
 * What a hit does beyond the number (a clone pops, a hold breaks, a coward runs, the fallen go
 * down) is `wound.ts`'s, which writes through here. `patch` can't set health, and a lint rule
 * keeps health out of object literals elsewhere in the engine.
 */

export interface HealthChange {
  readonly cause: HealthCause;
  /** Whoever did it, when someone did. */
  readonly by?: string;
}

/** The fighter with their health set: the one place a fighter's health is written. */
export function withHealth<F extends Pick<PlanFighter, 'health'>>(f: F, health: number): F {
  return { ...f, health };
}

/** A health change as the events that tell it: the change, and a fall when it is the last. */
function healthEvents(was: number, who: string, to: number, how: HealthChange): CombatEvent[] {
  const change: CombatEvent = {
    kind: 'health',
    who,
    to,
    cause: how.cause,
    ...(how.by ? { by: how.by } : {}),
  };
  // Someone who runs off is out of the fight, not down.
  const falls = to <= 0 && was > 0 && how.cause !== 'fled';
  return falls ? [change, { kind: 'fall', who }] : [change];
}

/** Sets one fighter's health, recording it as it is made. */
export function setHealth(round: Round, who: string, to: number, how: HealthChange): Round {
  const f = round.fighters.find((x) => x.id === who);
  if (!f || f.health === to) return round;
  const fighters = round.fighters.map((x) => (x.id === who ? withHealth(x, to) : x));
  // What has been told of them moves too, so the next telling doesn't say it again.
  const said = round.toldPools;
  const told = said?.[who];
  const toldPools = said && told ? { ...said, [who]: { ...told, health: to } } : undefined;
  return {
    ...round,
    fighters,
    story: [...round.story, ...healthEvents(f.health, who, to, how)],
    ...(toldPools ? { toldPools } : {}),
  };
}

/** Moves one fighter's health by `by` (negative: lost), within nothing and their full health. */
export function changeHealth(round: Round, who: string, by: number, how: HealthChange): Round {
  const f = round.fighters.find((x) => x.id === who);
  if (!f) return round;
  const to = Math.min(f.maxHealth, Math.max(0, f.health + by));
  return setHealth(round, who, to, how);
}
