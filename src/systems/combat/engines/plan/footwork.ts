import type { Discipline } from '@/systems/techniques';

import type { CombatTechnique, RangeBand } from '../../contract';
import { chakraCost } from '../../rules/body';
import { homeBand } from '../../rules/kit';
import { reactionLine } from '../../rules/narration';
import { RANGE_LABEL } from '../../rules/range';
import { hasVerb, moveGoal, substitutable } from '../../rules/verbs';
import type { Card } from './cards';
import { fighterIn, patch, paying, say, type PlanFighter, type Round } from './state';

/**
 * Move and substitute in a planned fight. A move is footwork no one contests: its user is
 * simply at the distance it takes them to. A substitution is a defence card: slotted, it
 * reacts on its own, swapping its owner out of the first physical or ninjutsu hit in a round
 * that would land (after a Dodge has had its chance), as long as they have the chakra for it.
 * Once a round, not once an exchange: one foe strikes about once an exchange, so more would
 * make its owner untouchable for as long as their chakra lasts.
 */

/** Between rounds, every substitution is ready again. */
export function substitutionsReady(fighters: readonly PlanFighter[]): PlanFighter[] {
  return fighters.map(({ substituteSpent: _spent, ...f }) => f);
}

type JutsuCard = Extract<Card, { kind: 'jutsu' }>;

/** Where a move technique would take this fighter, or null when it isn't one. */
export function moveDestination(fighter: PlanFighter, t: CombatTechnique): RangeBand | null {
  return moveGoal(t, homeBand(fighter));
}

export function move(round: Round, actor: PlanFighter, t: CombatTechnique): Round {
  const to = moveDestination(actor, t) ?? round.range;
  const where = RANGE_LABEL[to].toLowerCase();
  return { ...say(round, `${actor.name} flickers to ${where} range.`), range: to };
}

/** A substitution among the defences ready to react. */
function substitution(ready: readonly Card[]): JutsuCard | undefined {
  return ready.find(
    (c): c is JutsuCard => c.kind === 'jutsu' && hasVerb(c.technique, 'substitute'),
  );
}

/** What is about to land on whom. */
export interface Swap {
  readonly target: PlanFighter;
  readonly attacker: PlanFighter;
  /** What hits, for the narration. */
  readonly what: string;
  /** The art behind it; none for a plain blow or kunai. */
  readonly discipline: Discipline | undefined;
}

/**
 * Swaps the target out of a hit that would land, when a substitution is ready, unspent this
 * round, affordable and the hit isn't an illusion; else null, and the hit lands.
 */
export function substituted(round: Round, ready: readonly Card[], swap: Swap): Round | null {
  const { attacker } = swap;
  const target = fighterIn(round, swap.target.id) ?? swap.target;
  const card = substitution(ready);
  if (!card || target.substituteSpent === true || !substitutable(swap.discipline)) {
    return null;
  }
  const cost = chakraCost(target, card.technique);
  if (target.chakra < cost) return null;
  const fighters = patch(round.fighters, target.id, {
    ...paying(target, cost),
    substituteSpent: true,
  });
  return say(
    { ...round, fighters },
    reactionLine(
      `${target.name} swaps out of ${attacker.name}'s ${swap.what} with ${card.technique.name}.`,
      'swapped',
    ),
  );
}
