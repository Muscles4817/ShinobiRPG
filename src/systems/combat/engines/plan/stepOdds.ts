import { RANGE_BANDS } from '../../rules/range';
import { bandOf } from './distance';
import { opponentsOf, inSight } from './senses';
import type { PlanFighter, Round } from './state';
import { stepChance } from './stepContest';

/**
 * The chance a fighter's next step towards where they fight would be made now, against the
 * foe they face (`steps.ts`); null when they are there already or face no one.
 */
export function stepOdds(round: Round, self: PlanFighter): number | null {
  const goal = self.keepAt;
  const band = bandOf(round, self);
  if (goal === undefined || goal === band) return null;
  const foe = opponentsOf(round.fighters, self).find((f) => inSight(self, f));
  if (!foe) return null;
  const direction = RANGE_BANDS.indexOf(goal) < RANGE_BANDS.indexOf(band) ? 'in' : 'back';
  return stepChance(round, self, foe, direction);
}
