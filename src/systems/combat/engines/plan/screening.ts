import type { Rng } from '@/core';

import { alive, hasPerk } from '../../rules/body';
import { turnLine } from '../../rules/narration';
import { clonesLeft, drawFireChance } from '../../rules/verbs';
import type { Card } from './cards';
import { eyes } from './decoys';
import { patch, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Clones screening a charge in a planned fight (`rules/verbs/clones.ts`): when someone closes on
 * a holder, clones on their side (their own, or a teammate's) run in ahead of them and may draw
 * the shot. The holder spends their turn on the clones (an area bursts them all, anything else
 * one), and the one behind them is through.
 */

/** The fighter on the closer's side whose clones run ahead: the one with the most standing. */
function screenFor(round: Round, closer: PlanFighter): PlanFighter | undefined {
  return round.fighters
    .filter((f) => f.side === closer.side && alive(f) && clonesLeft(f) > 0)
    .sort((a, b) => clonesLeft(b) - clonesLeft(a))[0];
}

/** A holder's shot as clones meet it. */
export interface Shot {
  readonly holder: PlanFighter;
  readonly closer: PlanFighter;
  readonly card: Card;
  readonly rng: Rng;
}

function shotName(card: Card): string {
  return card.kind === 'jutsu' ? card.technique.name : 'kunai';
}

function isArea(card: Card): boolean {
  return card.kind === 'jutsu' && card.technique.effects.some((e) => e.verb === 'area');
}

/** The holder's shot spent on clones running ahead, or null when none draws it. */
export function drawnByClones(round: Round, { holder, closer, card, rng }: Shot): Round | null {
  const maker = screenFor(round, closer);
  const clones = maker?.clones;
  if (!maker || !clones) return null;
  const chance = drawFireChance(clones, eyes(holder, maker), hasPerk(holder, 'insight'));
  if (!rng.chance(chance)) return null;
  const left = isArea(card) ? 0 : clones.count - 1;
  const fighters = patch(round.fighters, maker.id, { clones: { ...clones, count: left } });
  const own = maker.id === closer.id;
  const line = tell(
    own
      ? '{h.poss} {what} tears into {c.poss} clones, and {c} {c.is} through.'
      : '{h.poss} {what} tears into {m.poss} clones, and {c} {c.is} through.',
    { h: holder, c: closer, m: maker, what: shotName(card) },
  );
  // The shot is the holder's, told as theirs.
  return { ...round, fighters, lines: [...round.lines, turnLine(line, holder.id)] };
}
