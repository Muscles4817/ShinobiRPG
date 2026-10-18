import { clamp } from '@/core';

import type { RangeBand } from '../../contract';
import { RANGE_BANDS, RANGE_LABEL, stepBack, stepIn } from '../../rules/range';
import { footingOf, withinGround } from '../../rules/ground';
import { cloneStepBonus, isPinned } from '../../rules/verbs';
import type { Card } from './cards';
import type { Turn } from './senses';
import { isEntry } from './stepping';
import { chakraCost } from '../../rules/body';
import { fighterIn, patch, paying, say, type Round } from './state';
import { holdOff } from './zoning';
import { blockedStepLine, chargeLine, momentOf, stepLine } from './voice';
import { tell } from '../../rules/telling';

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
  const closing = RANGE_BANDS.indexOf(to) < RANGE_BANDS.indexOf(round.range);
  const where = RANGE_LABEL[to].toLowerCase();
  return {
    ...say(round, stepLine(momentOf(round, actor.id), actor, where, closing)),
    range: to,
  };
}

/** The step's own contest, when nobody holds the fighter off. */
function stride(round: Round, { actor, target: foe, rng }: Turn, direction: 'in' | 'back'): Round {
  const to = direction === 'in' ? stepIn(round.range) : stepBack(round.range);
  if (withinGround(round.ground, to) !== to) {
    const line = '{a} back{a.s} away, but there’s a wall behind {a.them}.';
    return say(round, tell(line, { a: actor }));
  }
  const speedGap = actor.attributes.speed - (foe?.attributes.speed ?? 0);
  // Clones crowding round the one stepping make them harder to cut off.
  const contest =
    clamp(STEP_BASE + speedGap * STEP_PER_SPEED, STEP_MIN, STEP_MAX) + cloneStepBonus(actor);
  // Off their footing (on water they can't stand on), every step is harder.
  const chance = foe ? contest * footingOf(round.ground, actor) : 1;
  const where = RANGE_LABEL[to].toLowerCase();
  // The roll is made even with no foe to stop them (a sure step), as it always was.
  const made = rng.chance(chance);
  if (made || !foe) return arrive(round, { actor, target: foe, rng }, to);
  return say(round, blockedStepLine(momentOf(round, actor.id), actor, where, foe));
}

export function step(round: Round, turn: Turn, direction: 'in' | 'back'): Round {
  const { actor } = turn;
  if (isPinned(actor)) return say(round, tell('{a} strain{a.s} against the hold.', { a: actor }));
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

/** A charge met: what became of the round, whether it was stopped, and lines told after it. */
export interface Charged {
  readonly round: Round;
  readonly stopped: boolean;
  /** Getting through a hold-off, told once the charge itself has been. */
  readonly after: readonly string[];
}

/**
 * A charge: an entry played from further off meets a hold-off as a step does. Stopped, the
 * technique is lost (`round` is what became of it); otherwise it goes on to land.
 */
export function charge(round: Round, turn: Turn, card: Card): Charged {
  if (!isEntry(turn.actor, card, round.range) || isPinned(turn.actor)) {
    return { round, stopped: false, after: [] };
  }
  const met = holdOff(round, turn);
  if (met.outcome !== 'stopped' || card.kind !== 'jutsu') {
    const after = met.round.lines.slice(round.lines.length);
    return { round: { ...met.round, lines: round.lines }, stopped: false, after };
  }
  // Stopped, the charge is told before the fire that met it, and its chakra is spent.
  const { actor } = turn;
  const told = chargeLine(momentOf(round, actor.id), actor, card.technique.name);
  const lines = [...round.lines, told, ...met.round.lines.slice(round.lines.length)];
  const paid = paying(fighterIn(met.round, actor.id) ?? actor, chakraCost(actor, card.technique));
  const fighters = patch(met.round.fighters, actor.id, paid);
  return { round: { ...met.round, lines, fighters }, stopped: true, after: [] };
}
