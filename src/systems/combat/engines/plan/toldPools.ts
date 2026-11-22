import type { CombatAttributes } from '../../contract';
import type { CombatEvent, StoryPools, ToldEvent } from '../../storyContract';
import { maxBreath } from '../../rules/breath';
import { toldFrom } from '../../rules/narration';

/**
 * The one writer of a planned fight's story (`storyContract.ts`). Lines are told with `say`,
 * which first records what moved since the last telling (whose health and pools, who came onto
 * the field or left it), so a change shows with the first line after it and the screen folds
 * them in order (`storyFold.ts`). A writer that knows more about a change than that it happened
 * (whose hit it was: `health.ts`) records it itself as it makes it, and `say` has nothing left
 * to add for it. Typed by shape, so `state.ts` can re-export `say` without importing back.
 */

export type Pools = Readonly<Record<string, StoryPools>>;

interface Pooled {
  readonly id: string;
  readonly health: number;
  readonly chakra: number;
  readonly attributes: CombatAttributes;
  readonly breath?: number;
  readonly will?: number;
  readonly swarm?: { readonly count: number };
  readonly dust?: { readonly count: number };
}

/** A fighter's health and pools as the screen shows them. */
export function poolsOf(f: Pooled): Record<string, number> {
  const always = {
    health: f.health,
    chakra: f.chakra,
    breath: f.breath ?? maxBreath(f.attributes),
  };
  return {
    ...always,
    ...(f.will !== undefined ? { will: f.will } : {}),
    ...(f.swarm ? { hive: f.swarm.count } : {}),
    ...(f.dust ? { dust: f.dust.count } : {}),
  };
}

export function poolsNow(fighters: readonly Pooled[]): Pools {
  return Object.fromEntries(fighters.map((f) => [f.id, poolsOf(f)]));
}

/** Health, then the other pools, as events for what moved between two tellings of one fighter. */
export function poolsMoved(who: string, was: StoryPools, now: StoryPools): CombatEvent[] {
  const events: CombatEvent[] = [];
  const health = now.health;
  if (health !== undefined && health !== was.health) {
    events.push({ kind: 'health', who, to: health, cause: 'settled' });
    if (health <= 0 && (was.health ?? 0) > 0) events.push({ kind: 'fall', who });
  }
  const moved = Object.entries(now).filter(([pool, n]) => pool !== 'health' && was[pool] !== n);
  if (moved.length > 0) events.push({ kind: 'pools', who, to: Object.fromEntries(moved) });
  return events;
}

/** What moved between two tellings, as events; someone gone from the field has left it. */
export function changesSince(was: Pools | undefined, now: Pools): CombatEvent[] {
  const events: CombatEvent[] = [];
  for (const [who, theirs] of Object.entries(now)) {
    const before = was?.[who];
    if (before) events.push(...poolsMoved(who, before, theirs));
    else events.push({ kind: 'join', who, pools: theirs, statuses: [] });
  }
  for (const who of Object.keys(was ?? {})) if (!(who in now)) events.push({ kind: 'leave', who });
  return events;
}

interface Telling {
  readonly story: readonly CombatEvent[];
  readonly fighters: readonly Pooled[];
  readonly toldPools?: Pools;
}

/**
 * Tells lines: what moved since the last telling first, then the lines, each read into the event
 * it tells (`toldFrom`). Tell a change after making it.
 */
export function say<R extends Telling>(round: R, ...lines: string[]): R {
  if (lines.length === 0) return round;
  const now = poolsNow(round.fighters);
  const changes = changesSince(round.toldPools, now);
  return { ...round, story: [...round.story, ...changes, ...lines.map(toldFrom)], toldPools: now };
}

/**
 * Lines told between exchanges (a divider, a read, the fight's close), after a story: nothing has
 * moved in a turn there, and what the act changed is said as it hands back (`storyLevel.ts`).
 */
export function toldOn(
  story: readonly CombatEvent[],
  ...lines: readonly (string | ToldEvent)[]
): CombatEvent[] {
  return [...story, ...lines.map((l) => (typeof l === 'string' ? toldFrom(l) : l))];
}

/** Tells lines as `actorId`'s, who acts inside someone else's turn (a holder firing, a copy). */
export function sayAs<R extends Telling>(round: R, actorId: string, ...lines: string[]): R {
  const told = say(round, ...lines);
  return { ...told, story: toldAs(told.story, told.story.length - lines.length, actorId) };
}

/** Lines told from `from` on, as `actorId`'s; a line already given to someone keeps them. */
export function toldAs(
  story: readonly CombatEvent[],
  from: number,
  actorId: string,
): CombatEvent[] {
  return story.map((e, i) =>
    i < from || e.kind !== 'told' || e.actor !== undefined ? e : { ...e, actor: actorId },
  );
}
