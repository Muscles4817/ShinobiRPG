import type { CombatantView } from '../../contract';
import { viewOf } from '../../rules/body';
import { bandOf, distanceBetween } from './distance';
import { intentLine, knownLine } from './intent';
import { learnedLine } from './learned';
import { beliefLines } from './mind';
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

/** What a foe has learned of you, for its view (only when it has learned anything). */
function learnedOf(plan: PlanState, f: PlanFighter): Pick<CombatantView, 'learned'> {
  const learned = learnedLine(plan, f);
  return learned ? { learned } : {};
}

/** What you make of a foe so far, for its view (only once you believe anything of them). */
function beliefsOf(plan: PlanState, f: PlanFighter): Pick<CombatantView, 'beliefs'> {
  if (f.side !== 'enemy') return {};
  const beliefs = beliefLines(playerOf(plan), f, plan.round);
  return beliefs.length > 0 ? { beliefs } : {};
}

export function combatantView(plan: PlanState, f: PlanFighter, insight: boolean): CombatantView {
  return {
    ...viewOf(f, statuses(plan, f), intentLine(plan, f, insight)),
    ...knownOf(plan, f, insight),
    ...learnedOf(plan, f),
    ...beliefsOf(plan, f),
    ...distanceOf(plan, f),
    // A hidden foe the player sees anyway is shown, and aimed at, as seen.
    ...(seenByPlayer(plan, f) ? { statuses: statusesShown(plan, f), targetable: true } : {}),
    ...onStage(f),
  };
}
