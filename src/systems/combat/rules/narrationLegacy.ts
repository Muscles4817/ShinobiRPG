/**
 * A story saved before the fight was told as events (`storyContract.ts`): a list of lines that
 * carried whose turn each was, where the fight stood, how big the turn was, and where pools and
 * statuses stood once it had played, all inside the sentence. Read here, once, into the events
 * they meant, so a fight saved mid-way (or a finished one kept for the watch screen) still plays.
 * Part of the narration module: nothing else reads what a line carries.
 */

import { AREA_SIZES, ELEMENTS } from '@/systems/techniques';

import {
  NARRATION_OFF_PLAN,
  type CombatEvent,
  type NarrationForce,
  type NarrationOffPlan,
  type StoryPools,
  type ToldEvent,
} from '../storyContract';
import type { RangeBand } from '../sides';
import { toldFrom } from './narration';

const ACTOR_MARKER = /⟦by:([^⟧]+)⟧/;
const RANGE_MARKER = /⟦at:(close|mid|far)⟧/;
const FORCE_MARKER = /⟦fx:(\d):([a-z-]+):([a-z-]+)⟧/;
const OFF_PLAN_MARKER = /⟦op:([a-z-]+)⟧/;
const ROUND_START = '⟦rs⟧';
const POOLS_MARKER = /⟦pl:([^⟧]+)⟧/g;
const STATUS_MARKER = /⟦st:([^⟧]+)⟧/;
/** The chakra-only form an even earlier version wrote. */
const CHAKRA_MARKER = /⟦ck:([^⟧]+)⟧/;
/** Dividers between exchanges and rounds were told by their opening dash. */
const DIVIDER = '—';

/** "id=…" pairs, split at the last "=" (ids may hold a colon, never an equals sign). */
function byFighter(found: string): [string, string][] {
  return found.split('|').map((pair) => {
    const at = pair.lastIndexOf('=');
    return [pair.slice(0, at), pair.slice(at + 1)];
  });
}

/** "chakra:40,breath:12" as { chakra: 40, breath: 12 }. */
function amountsIn(said: string): Record<string, number> {
  return Object.fromEntries(
    said.split(',').map((pool) => {
      const [name = '', amount] = pool.split(':');
      return [name, Number(amount)];
    }),
  );
}

/** Every pools marker on a line, the later laid over the earlier. */
function poolsIn(line: string): Record<string, Record<string, number>> {
  const pools: Record<string, Record<string, number>> = {};
  for (const m of line.matchAll(POOLS_MARKER))
    for (const [id, said] of byFighter(m[1] ?? ''))
      pools[id] = { ...pools[id], ...amountsIn(said) };
  const chakra = CHAKRA_MARKER.exec(line)?.[1];
  if (chakra) for (const [id, n] of byFighter(chakra)) pools[id] = { chakra: Number(n) };
  return pools;
}

function statusesIn(line: string): Record<string, string[]> {
  const found = STATUS_MARKER.exec(line)?.[1];
  if (!found) return {};
  return Object.fromEntries(
    byFighter(found).map(([id, said]) => [id, said === '' ? [] : said.split(';')]),
  );
}

function forceIn(line: string): NarrationForce | null {
  const found = FORCE_MARKER.exec(line);
  if (!found) return null;
  const size = AREA_SIZES.find((s) => s === found[2]) ?? null;
  const element = ELEMENTS.find((e) => e === found[3]) ?? null;
  return { grade: Number(found[1]), size, element };
}

function isOffPlan(word: string | undefined): word is NarrationOffPlan {
  return NARRATION_OFF_PLAN.some((w) => w === word);
}

function isRange(word: string | undefined): word is RangeBand {
  return word === 'close' || word === 'mid' || word === 'far';
}

/** The line itself, with what the old markers said of its turn. */
function toldOf(line: string): ToldEvent {
  const told = toldFrom(line);
  const actor = ACTOR_MARKER.exec(line)?.[1];
  const range = RANGE_MARKER.exec(line)?.[1];
  const force = forceIn(line);
  const offPlan = OFF_PLAN_MARKER.exec(line)?.[1];
  return {
    ...told,
    ...(actor ? { actor } : {}),
    ...(isRange(range) ? { range } : {}),
    ...(force ? { force } : {}),
    ...(isOffPlan(offPlan) ? { offPlan } : {}),
    ...(line.startsWith(DIVIDER) ? { divider: true as const } : {}),
    ...(line.includes(ROUND_START) ? { opensRound: true as const } : {}),
  };
}

/**
 * What one fighter's pools said: someone new stands (on a divider, as a stretch opens) or joins
 * (mid-fight); anyone else's pools and health move.
 */
function poolEvents(id: string, pools: StoryPools, seen: Seen): CombatEvent[] {
  if (!seen.known.has(id)) {
    seen.known.add(id);
    return [{ kind: seen.opening ? 'stand' : 'join', who: id, pools, statuses: [] }];
  }
  const { health, ...rest } = pools;
  return [
    ...(health === undefined
      ? []
      : [{ kind: 'health', who: id, to: health, cause: 'settled' } as const]),
    ...(Object.keys(rest).length > 0 ? [{ kind: 'pools', who: id, to: rest } as const] : []),
  ];
}

interface Seen {
  readonly known: Set<string>;
  /** The line is a divider: those it first names were standing as the stretch opened. */
  readonly opening: boolean;
}

/** Lines told the old way (a fight saved before events, or a shelved engine's log) as the events they told, in order. */
export function storyOfLines(lines: readonly string[]): CombatEvent[] {
  const known = new Set<string>();
  return lines.flatMap((line): CombatEvent[] => {
    const seen = { known, opening: line.startsWith(DIVIDER) };
    const pools = Object.entries(poolsIn(line)).flatMap(([id, p]) => poolEvents(id, p, seen));
    const statuses = Object.entries(statusesIn(line)).map(([who, s]): CombatEvent => ({
      kind: 'status',
      who,
      statuses: s,
    }));
    return [...pools, ...statuses, toldOf(line)];
  });
}

/** Whether a saved story is in the old shape: lines, not events. */
export function isLegacyStory(story: readonly unknown[]): story is readonly string[] {
  return story.some((e) => typeof e === 'string');
}
