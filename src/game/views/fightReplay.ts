import {
  splitNarration,
  type CombatantView,
  type CombatView,
  type Narration,
  type NarrationForce,
  type NarrationPools,
  type NarrationStatuses,
  type RangeBand,
} from '@/systems/combat';
import type { JournalChip } from '@/systems/journal';

import { combatLog, type CombatLogLine } from './combatLog';

/**
 * The watch screen's beats: the fight log from a point on, one beat per line, each saying who
 * acted, on whom, where the fight stood and everyone's health once it had played. Engines tag
 * whose turn a line was written in (`turnLine`); who it was aimed at is the other fighter the
 * line names. Health is rebuilt backwards from the fight as it stands now, so the last beat
 * always matches the screen; in between, an amount goes to the fighter the line is about.
 * Pools (chakra, breath, a hive, dust) and statuses are read forwards from the lines that say where they
 * stand (each exchange's divider, and a turn that moved them), so they are only known from the
 * first such line on.
 */

/** "— Second exchange —": dividers between exchanges and rounds. */
const DIVIDER = '—';

export interface FightBeat {
  /** A divider ("Second exchange") or a line of the fight. */
  readonly kind: 'divider' | 'line';
  readonly text: string;
  readonly chips: readonly JournalChip[];
  readonly actorId: string | null;
  readonly targetId: string | null;
  readonly range: RangeBand | null;
  /** How big the turn the beat belongs to was (who threw it, how wide, what element). */
  readonly force: NarrationForce | null;
  /** Every fighter's health once this beat has played, by combatant id. */
  readonly health: Readonly<Record<string, number>>;
  /** Fighters' pools once this beat has played, by id, as far as the lines have said them. */
  readonly pools: NarrationPools;
  /** Fighters' statuses once this beat has played, by id, as far as the lines have said them. */
  readonly statuses: NarrationStatuses;
}

interface Named {
  readonly id: string;
  readonly name: string;
}

/** The fighter (other than the actor) the line names first: who it is aimed at. */
function namedIn(text: string, fighters: readonly Named[], actorId: string | null): string | null {
  // Longest names first, so "Bandit Archer" is not read as a "Bandit".
  const byLength = [...fighters].sort((a, b) => b.name.length - a.name.length);
  let found: { id: string; at: number } | null = null;
  let rest = text;
  for (const f of byLength) {
    const at = rest.indexOf(f.name);
    if (at < 0) continue;
    rest = rest.replaceAll(f.name, ' '.repeat(f.name.length));
    if (f.id !== actorId && (!found || at < found.at)) found = { id: f.id, at };
  }
  return found?.id ?? null;
}

/** Whose health a line's amounts move: a counter hurts the attacker; a lone heal is the actor. */
export function amountOwner(said: Narration, targetId: string | null): string | null {
  const actor = said.actorId ?? null;
  if (said.reactions.includes('countered')) return actor;
  return targetId ?? actor;
}

function healthChange(said: Narration): number {
  return said.amounts.reduce((sum, a) => sum + (a.kind === 'harm' ? -a.amount : a.amount), 0);
}

interface Parsed {
  readonly said: Narration;
  /** The line as the screen tells it (a divider, or a sentence with its chips). */
  readonly shown: CombatLogLine;
  readonly targetId: string | null;
}

type Health = Readonly<Record<string, number>>;

/** Health before a line played, given health after it. */
function undo(after: Health, { said, targetId }: Parsed, max: Health): Health {
  const owner = amountOwner(said, targetId);
  const change = healthChange(said);
  const now = owner === null ? undefined : after[owner];
  if (owner === null || now === undefined || change === 0) return after;
  return { ...after, [owner]: Math.min(max[owner] ?? now, Math.max(0, now - change)) };
}

/** Health after each line, walking back from the fight as it stands now. */
function healthAfterEach(parsed: readonly Parsed[], fighters: readonly CombatantView[]): Health[] {
  const max = Object.fromEntries(fighters.map((f) => [f.id, f.maxHealth]));
  const now: Health = Object.fromEntries(fighters.map((f) => [f.id, f.health]));
  const after: Health[] = [];
  parsed.reduceRight((current, line) => {
    after.unshift(current);
    return undo(current, line, max);
  }, now);
  return after;
}

/** Pools as they stood, with what a line says laid over them (a turn says only what it moved). */
function withPools(was: NarrationPools, said: NarrationPools): NarrationPools {
  const ids = Object.keys(said);
  return { ...was, ...Object.fromEntries(ids.map((id) => [id, { ...was[id], ...said[id] }])) };
}

/** Where the story has reached: its place after the last line, counting lines let go. */
export function storyEnd(view: CombatView): number {
  return (view.logOffset ?? 0) + view.log.length;
}

/** Who a line is aimed at: the first fighter it names by id, else by name, other than the actor. */
export function lineTarget(said: Narration, fighters: readonly Named[]): string | null {
  const actorId = said.actorId ?? null;
  // Lines name fighters as the story calls them ("you"), so they say whom by id.
  return said.named
    ? (said.named.find((id) => id !== actorId) ?? null)
    : namedIn(said.text, fighters, actorId);
}

/** The beats of the fight from story line `from` on (a place as `storyEnd` counts them). */
export function fightReplay(view: CombatView, from: number): FightBeat[] {
  const start = Math.max(0, from - (view.logOffset ?? 0));
  const parsed = view.log.slice(start).flatMap((line): Parsed[] => {
    const said = splitNarration(line);
    const targetId = lineTarget(said, view.combatants);
    return combatLog([line]).map((shown) => ({ said, shown, targetId }));
  });
  const health = healthAfterEach(parsed, view.combatants);
  let pools: NarrationPools = {};
  let statuses: NarrationStatuses = {};
  // Until a line says where the fight stands, it stands where the first such line says.
  let range = parsed.find((p) => p.said.range)?.said.range ?? view.range ?? null;
  return parsed.map(({ said, shown, targetId }, i): FightBeat => {
    range = said.range ?? range;
    pools = said.pools ? withPools(pools, said.pools) : pools;
    statuses = said.statuses ? { ...statuses, ...said.statuses } : statuses;
    const divider = shown.kind === 'round' || said.text.startsWith(DIVIDER);
    return {
      kind: divider ? 'divider' : 'line',
      text: shown.text,
      chips: shown.kind === 'story' ? shown.chips : [],
      actorId: said.actorId ?? null,
      targetId,
      range,
      force: said.force ?? null,
      health: health[i] ?? {},
      pools,
      statuses,
    };
  });
}
