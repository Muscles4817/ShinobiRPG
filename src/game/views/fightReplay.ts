import {
  splitNarration,
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
 * acted, on whom, where the fight stood and everyone's health and pools once it had played.
 * Engines tag whose turn a line was written in (`turnLine`); who it was aimed at is the other
 * fighter the line names. Health and pools are folded forwards from what the lines say
 * (`poolsLine`): each exchange's divider tells everyone in full, every line tells what moved
 * since the one before, and the last line of an exchange tells everyone again, so what is shown
 * is exactly what has been told, in order, and the last beat is the fight as it stands.
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
  /**
   * Who the lines have put on the field so far: everyone a line has said the pools of. Empty when
   * the engine says none (the stage then shows everyone); a fighter called mid-round is in it
   * only from the line that brought them.
   */
  readonly present: readonly string[];
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

interface Parsed {
  readonly said: Narration;
  /** The line as the screen tells it (a divider, or a sentence with its chips). */
  readonly shown: CombatLogLine;
  readonly targetId: string | null;
}

/** Pools as they stood, with what a line says laid over them (a turn says only what it moved). */
function withPools(was: NarrationPools, said: NarrationPools): NarrationPools {
  const ids = Object.keys(said);
  return { ...was, ...Object.fromEntries(ids.map((id) => [id, { ...was[id], ...said[id] }])) };
}

/** Health as the lines have said it (a pool like any other), by fighter. */
function saidHealth(pools: NarrationPools): Record<string, number> {
  return Object.fromEntries(
    Object.entries(pools).flatMap(([id, p]) => (p.health === undefined ? [] : [[id, p.health]])),
  );
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
  let pools: NarrationPools = {};
  let statuses: NarrationStatuses = {};
  // Until a line says where the fight stands, it stands where the first such line says.
  let range = parsed.find((p) => p.said.range)?.said.range ?? view.range ?? null;
  return parsed.map(({ said, shown, targetId }): FightBeat => {
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
      health: saidHealth(pools),
      pools,
      statuses,
      present: Object.keys(pools),
    };
  });
}
