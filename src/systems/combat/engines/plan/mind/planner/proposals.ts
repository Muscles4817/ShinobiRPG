import { alive } from '../../../../rules/body';
import { distanceBetween } from '../../distance';
import { opponentsOf } from '../../senses';
import type { CardId, PlanFighter, PlanState } from '../../state';
import type { Objective } from '../shape';

/**
 * What an objective proposes (`docs/design/combat-ai-plan.md` Parts 6–7): the moves a fighter
 * holding it means to try first. The planner scores them beside its other candidates, and the
 * first that can be played is what the fighter does unless a plan beats it clearly
 * (`candidates.ts`, `search.ts`), in place of today's hand-written rules. Objectives are taken
 * on one at a time, each measured against the rule it retires before the next
 * (`docs/design/research/objectives-choose.md`); one not yet taken on proposes nothing, and its
 * fighter keeps today's rules.
 */

/** The objectives that propose their own moves so far. */
export const PROPOSING: ReadonlySet<Objective> = new Set<Objective>(['recover']);

const GATHER: CardId = 'gather';
const STEP_BACK: CardId = 'step-back';

/** Some living foe stands close enough to strike them now. */
function crowded(state: PlanState, self: PlanFighter): boolean {
  return opponentsOf(state.fighters, self).some(
    (f) => alive(f) && distanceBetween(state, self.id, f.id) === 'close',
  );
}

/**
 * Recover: draw breath and chakra back. Gathering leaves them open, so with a foe up close they
 * get out of reach first, and gather once there's room.
 */
function recovering(state: PlanState, self: PlanFighter): CardId[] {
  return crowded(state, self) ? [STEP_BACK, GATHER] : [GATHER];
}

/** The moves this fighter's objective proposes, first choice first. */
export function proposalsFor(state: PlanState, self: PlanFighter): CardId[] {
  const objective = self.objective?.id;
  if (objective === undefined || !PROPOSING.has(objective)) return [];
  switch (objective) {
    case 'recover':
      return recovering(state, self);
    case 'wear-down':
    case 'finish':
    case 'set-up':
    case 'survive':
    case 'control-distance':
    case 'find':
    case 'escalate':
      return [];
  }
}
