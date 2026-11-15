import { hasVerb, isHindering } from '../../../rules/verbs';
import { isOffence, type Card } from '../cards';
import { bandOf } from '../distance';
import type { AttackStyle, DefenceKind } from '../readShape';
import { inSight, opponentsOf } from '../senses';
import type { PlanFighter, Round } from '../state';
import type { RangeBand } from '../../../contract';
import type { Capability, Witness } from './shape';

/**
 * Observations, written as the exchange resolves (`docs/design/combat-ai-plan.md` Part 5): an
 * action or a defence is witnessed by the opponents who have its doer in sight at that moment.
 * What they make of it is the mind's business at the exchange's end (`beliefs.ts`). Writing it
 * changes nothing in the fight.
 */

function witnessed(round: Round, witness: Witness): Round {
  return { ...round, witnessed: [...(round.witnessed ?? []), witness] };
}

function watchersOf(round: Round, id: string): string[] {
  const doer = round.fighters.find((f) => f.id === id);
  if (!doer) return [];
  return opponentsOf(round.fighters, doer)
    .filter((o) => inSight(o, doer))
    .map((o) => o.id);
}

/** What a card showed its user can do. */
function shows(round: Round, actor: PlanFighter, card: Card): Capability[] {
  const far = isOffence(card) && bandOf(round, actor) === 'far' ? (['far'] as const) : [];
  if (card.kind !== 'jutsu') return [...far];
  const t = card.technique;
  return [
    ...far,
    ...(hasVerb(t, 'area') ? (['area'] as const) : []),
    ...(isHindering(t) ? (['hold'] as const) : []),
    ...(hasVerb(t, 'heal') ? (['heal'] as const) : []),
  ];
}

/** Whether a card is an act worth noticing: an attack, a technique or a tool, not footwork. */
function noticed(card: Card): boolean {
  return card.kind === 'jutsu' || card.kind === 'item' || isOffence(card);
}

/** An act seen by whoever has the actor in sight. */
export function witnessAct(
  round: Round,
  actorId: string,
  { card, id, style }: { card: Card; id: string; style: AttackStyle | null },
): Round {
  const actor = round.fighters.find((f) => f.id === actorId);
  if (!actor || !noticed(card)) return round;
  const seenBy = watchersOf(round, actorId);
  if (seenBy.length === 0) return round;
  const showing = shows(round, actor, card);
  return witnessed(round, {
    kind: 'attack',
    of: actorId,
    card: id,
    ...(style ? { style } : {}),
    shows: showing,
    seenBy,
  });
}

/** A defence seen to react, by whoever has its keeper in sight. */
export function witnessDefence(
  round: Round,
  id: string,
  { band, defence }: { band: RangeBand; defence: DefenceKind },
): Round {
  const seenBy = watchersOf(round, id);
  return seenBy.length === 0
    ? round
    : witnessed(round, { kind: 'defence', of: id, band, defence, seenBy });
}
