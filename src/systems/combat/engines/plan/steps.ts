import { clamp } from '@/core';

import type { RangeBand } from '../../contract';
import { RANGE_LABEL, stepBack, stepIn } from '../../rules/range';
import { isPinned } from '../../rules/verbs';
import type { Turn } from './senses';
import { patch, say, type Round } from './state';
import { holdOff } from './zoning';

/**
 * A step: the fighter tries for the next distance in or out, contested by the foe's speed. A
 * step costs the turn, and while on the move they can't set a Guard or a Counter (`movedAt`, read in
 * `react.ts`). Stepping in on someone who holds foes off is their contest instead (`zoning.ts`).
 */

const STEP_BASE = 0.55;
const STEP_PER_SPEED = 0.04;
const STEP_MIN = 0.25;
const STEP_MAX = 0.85;

function arrive(round: Round, { actor }: Turn, to: RangeBand): Round {
  return {
    ...say(round, `${actor.name} moves to ${RANGE_LABEL[to].toLowerCase()} range.`),
    range: to,
  };
}

/** The step's own contest, when nobody holds the fighter off. */
function stride(round: Round, { actor, target: foe, rng }: Turn, direction: 'in' | 'back'): Round {
  const to = direction === 'in' ? stepIn(round.range) : stepBack(round.range);
  const speedGap = actor.attributes.speed - (foe?.attributes.speed ?? 0);
  const chance = foe ? clamp(STEP_BASE + speedGap * STEP_PER_SPEED, STEP_MIN, STEP_MAX) : 1;
  const where = RANGE_LABEL[to].toLowerCase();
  return rng.chance(chance)
    ? arrive(round, { actor, target: foe, rng }, to)
    : say(
        round,
        `${actor.name} tries for ${where} range, but ${foe?.name ?? 'no one'} won't allow it.`,
      );
}

export function step(round: Round, turn: Turn, direction: 'in' | 'back'): Round {
  const { actor } = turn;
  if (isPinned(actor)) return say(round, `${actor.name} strains against the hold.`);
  const moving = {
    ...round,
    fighters: patch(round.fighters, actor.id, { movedAt: round.number }),
  };
  if (direction === 'back') return stride(moving, turn, direction);
  const met = holdOff(moving, turn);
  switch (met.outcome) {
    case 'stopped':
      return met.round;
    case 'through':
      return arrive(met.round, turn, stepIn(round.range));
    case 'unopposed':
      return stride(met.round, turn, direction);
  }
}
