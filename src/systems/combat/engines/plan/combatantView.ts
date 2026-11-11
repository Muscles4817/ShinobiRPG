import type { CombatantView } from '../../contract';
import { viewOf } from '../../rules/body';
import { bandOf, distanceBetween } from './distance';
import { intentLine, knownLine } from './intent';
import { formOf } from './scene';
import { playerOf, type PlanFighter, type PlanState } from './state';
import { seenByPlayer, statuses, statusesShown } from './statusView';
import { onStage } from './swarmView';

/**
 * One fighter as the screen shows them: their body and conditions, what they seem about to do,
 * the cards you know they hold, and how far they stand.
 */

/** How far a fighter stands: a foe from you, your side from the foe each faces (`distance.ts`). */
function distanceOf(plan: PlanState, f: PlanFighter): Pick<CombatantView, 'distance'> {
  const player = playerOf(plan);
  const distance =
    f.side === player.side ? bandOf(plan, f) : distanceBetween(plan, player.id, f.id);
  return { distance };
}

/** The cards you know a foe holds, for its view (only when there are any). */
function knownOf(plan: PlanState, f: PlanFighter, insight: boolean): Pick<CombatantView, 'known'> {
  const known = knownLine(plan, f, insight);
  return known ? { known } : {};
}

export function combatantView(plan: PlanState, f: PlanFighter, insight: boolean): CombatantView {
  return {
    ...viewOf(f, statuses(plan, f), intentLine(plan, f, insight)),
    form: formOf(f),
    ...knownOf(plan, f, insight),
    ...distanceOf(plan, f),
    // A hidden foe the player sees anyway is shown, and aimed at, as seen.
    ...(seenByPlayer(plan, f) ? { statuses: statusesShown(plan, f), targetable: true } : {}),
    ...onStage(f),
  };
}
