import { STAT_GRADES, statTier } from '@/systems/stats';

import type { CombatTechnique } from '../../contract';
import {
  forceLine,
  offPlanLine,
  poolsLine,
  roundStartLine,
  statusLine,
  turnLine,
  type NarrationForce,
  type NarrationPools,
  type NarrationStatuses,
} from '../../rules/narration';
import { findCard, type Card } from './cards';
import type { CardId, PlanFighter, Round } from './state';
import { statusesShown } from './statusView';
import { poolAmounts } from './swarmView';

/**
 * Staging a turn for the screen. How big a turn was, for its sound (`forceLine`): the grade of its maker in the art
 * the card works by, the ground an area technique covered, and its element. Two genin trading
 * kunai and two jōnin trading fire are the same fight on paper (damage is a gap, decision 16),
 * so the size has to come from who fought and what they threw, not from the damage.
 */

type Art = 'taijutsu' | 'ninjutsu' | 'genjutsu' | 'kenjutsu' | 'fuuinjutsu';

function artOf(fighter: PlanFighter, card: Card | null): Art {
  if (card?.kind === 'jutsu') return card.technique.discipline;
  if (card?.kind === 'strike') return 'taijutsu';
  const { attributes } = fighter;
  // Anything else (a throw, a tool, a step) is done as well as their best art allows.
  const arts: readonly Art[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];
  return arts.reduce((best, art) => (attributes[art] > attributes[best] ? art : best));
}

function areaOf(technique: CombatTechnique): NarrationForce['size'] {
  for (const effect of technique.effects) {
    if (effect.verb === 'area') return effect.size ?? 'small';
  }
  return null;
}

/** The force of `fighter`'s turn playing card `id` (or none, for a turn that played nothing). */
export function turnForce(fighter: PlanFighter, id: CardId | undefined): NarrationForce {
  const card = id ? findCard(fighter, id) : null;
  const grade = STAT_GRADES.indexOf(statTier(fighter.attributes[artOf(fighter, card)]).grade);
  const technique = card?.kind === 'jutsu' ? card.technique : null;
  return {
    grade: Math.max(0, grade),
    size: technique ? areaOf(technique) : null,
    element: technique?.element ?? null,
  };
}

/** Everyone's pools, by id, for a line that says where they stand (`poolsLine`). */
function poolsOf(fighters: readonly PlanFighter[]): Record<string, Record<string, number>> {
  return Object.fromEntries(fighters.map((f) => [f.id, poolAmounts(f)]));
}

/** Everyone's statuses, by id, as the screen shows them (`statusLine`). */
function statusesOf(round: Round): Record<string, string[]> {
  return Object.fromEntries(round.fighters.map((f) => [f.id, statusesShown(round, f)]));
}

/**
 * "— Second exchange —", saying where everyone's pools and statuses start it; the first of a
 * round says it opens the round.
 */
export function exchangeDivider(name: string, round: Round, first: boolean): string {
  const divider = `— ${name} exchange —`;
  const opening = first ? roundStartLine(divider) : divider;
  return statusLine(poolsLine(opening, poolsOf(round.fighters)), statusesOf(round));
}

/** The statuses of those whose statuses the turn changed (an empty list where all ended). */
function statusesMoved(before: Round, after: Round): NarrationStatuses {
  const was = statusesOf(before);
  return Object.fromEntries(
    Object.entries(statusesOf(after)).filter(
      ([id, now]) => now.join(';') !== (was[id] ?? []).join(';'),
    ),
  );
}

/** The pools the turn moved, for each fighter it moved any of. */
function poolsMoved(before: Round, after: Round): NarrationPools {
  const was = poolsOf(before.fighters);
  return Object.fromEntries(
    Object.entries(poolsOf(after.fighters)).flatMap(([id, now]) => {
      const moved = Object.entries(now).filter(([pool, n]) => was[id]?.[pool] !== n);
      return moved.length > 0 ? [[id, Object.fromEntries(moved)]] : [];
    }),
  );
}

/**
 * A turn as the screen stages it: every line it wrote tagged as its maker's, the first with
 * the distance the turn began at and the last with the new one if the turn moved the fight,
 * each with how big the turn was, and the last with the pools and statuses of anyone the
 * turn changed them for. The tags are narration only: the turn plays exactly as untagged.
 */
export function staged(before: Round, after: Round, id: string): Round {
  const { played, offPlan, ...turn } = after;
  const actor = turn.fighters.find((f) => f.id === id);
  const force = actor ? turnForce(actor, played) : null;
  const added = turn.lines.slice(before.lines.length);
  const last = added.length - 1;
  const rangeAt = (i: number) => {
    if (i === last && turn.range !== before.range) return turn.range;
    return i === 0 ? before.range : undefined;
  };
  const moved = poolsMoved(before, turn);
  const changed = statusesMoved(before, turn);
  const tagged = added.map((line, i) => {
    const theirs = turnLine(line, id, rangeAt(i));
    const forced = force ? forceLine(theirs, force) : theirs;
    const sized = i === 0 && offPlan ? offPlanLine(forced, offPlan) : forced;
    return i === last ? statusLine(poolsLine(sized, moved), changed) : sized;
  });
  return { ...turn, lines: [...before.lines, ...tagged] };
}
