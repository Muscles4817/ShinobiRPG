import { clamp } from '@/core';

import { alive } from '../../rules/body';
import { footingOf } from '../../rules/ground';
import { sizeGap, STEP_PER_SIZE } from '../../rules/size';
import { cloneStepBonus } from '../../rules/verbs';
import { distanceBetween } from './distance';
import { farGapScale } from './farGap';
import type { PlanFighter, Round } from './state';

/**
 * The contest of a step (`steps.ts`): speed against speed, size, clones and footing, and the far
 * gap. Kept on its own so a plan can ask how likely a step is (`stepOdds.ts`) without the step.
 */

const STEP_BASE = 0.55;
const STEP_PER_SPEED = 0.04;
const STEP_MIN = 0.25;
const STEP_MAX = 0.85;

/** Whether someone else on the stepper's side is already up close with `foe`, keeping them busy. */
function engaged(round: Round, actor: PlanFighter, foe: PlanFighter): boolean {
  return round.fighters.some(
    (f) =>
      f.side === actor.side &&
      f.id !== actor.id &&
      alive(f) &&
      distanceBetween(round, f.id, foe.id) === 'close',
  );
}

/**
 * The chance a step past `foe` is made: speed against speed, size, clones and footing. Someone
 * already fighting another up close can't keep a second away: stepping in on them is sure.
 */
export function stepChance(
  round: Round,
  actor: PlanFighter,
  foe: PlanFighter,
  direction: 'in' | 'back',
): number {
  if (direction === 'in' && engaged(round, actor, foe)) return 1;
  const speedGap = actor.attributes.speed - foe.attributes.speed;
  // A bigger body leans its weight into a step in (`size.ts`).
  const weight = direction === 'in' ? Math.max(0, sizeGap(actor, foe)) * STEP_PER_SIZE : 0;
  // Clones crowding round the one stepping make them harder to cut off.
  const contest =
    clamp(STEP_BASE + speedGap * STEP_PER_SPEED, STEP_MIN, STEP_MAX) +
    cloneStepBonus(actor) +
    weight;
  // Off their footing (on water they can't stand on), every step is harder; so is the far gap.
  const at = distanceBetween(round, actor.id, foe.id);
  return contest * footingOf(round.ground, actor) * farGapScale(actor, at, direction);
}
