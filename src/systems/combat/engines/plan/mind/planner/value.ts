import { maxBreath } from '../../../../rules/breath';
import { bandOf } from '../../distance';
import type { PlanFighter, PlanState } from '../../state';
import type { Objective } from '../shape';

/**
 * What an outcome is worth to the mind planning (`docs/design/combat-ai-plan.md` Parts 6–7): the
 * race (health dealt to the other side against health taken, a win or a fall weighed heavily),
 * as the objective it holds weighs it. The objective never names a move; it only says what an
 * outcome is worth, and the search finds the moves. Surviving minds their own hurt more;
 * recovering values chakra and breath come back (the experiment that found a dry caster does
 * better to gather, `prototypes/objectives/RESULTS.md`); keeping distance values ending at home;
 * finding values no foe left hidden.
 */

/** A win or a fall, against health (100 a body). */
const ENDED = 150;
/** How much more a surviving mind minds its own hurt. */
const SURVIVING_HURT = 2;
/** A whole pool regained, for a mind recovering: worth this much health. */
const POOL_WORTH = 40;
/** Ending where it fights from, for a mind keeping distance. */
const HOME_WORTH = 15;
/** No foe left hidden, for a mind looking for one. */
const FOUND_WORTH = 25;

const isEnemy = (f: PlanFighter) => f.side === 'enemy';

function healthOf(state: PlanState, enemy: boolean): number {
  return state.fighters
    .filter((f) => isEnemy(f) === enemy && f.shadowOf === undefined)
    .reduce((sum, f) => sum + Math.max(0, f.health), 0);
}

function pools(f: PlanFighter): number {
  const chakra = f.maxChakra > 0 ? f.chakra / f.maxChakra : 1;
  const top = maxBreath(f.attributes);
  return chakra + (f.breath ?? top) / top;
}

/** What the objective adds for the planner's own state at the end. */
function aimed(objective: Objective | undefined, start: PlanState, end: PlanState, selfId: string) {
  const before = start.fighters.find((f) => f.id === selfId);
  const after = end.fighters.find((f) => f.id === selfId);
  if (!before || !after) return 0;
  switch (objective) {
    case 'recover':
      return (pools(after) - pools(before)) * POOL_WORTH;
    case 'control-distance':
      return after.keepAt === undefined || bandOf(end, after) === after.keepAt ? HOME_WORTH : 0;
    case 'find':
      return end.fighters.some((f) => isEnemy(f) !== isEnemy(after) && f.hidden && f.health > 0)
        ? 0
        : FOUND_WORTH;
    case 'survive':
    case 'wear-down':
    case 'finish':
    case 'set-up':
    case 'escalate':
    case undefined:
      return 0;
  }
}

/** A fight won is worth `ENDED`, lost its negative; a stalemate or an escape nothing. */
function endedWorth(result: PlanState['result'], enemy: boolean): number {
  if (result === 'victory') return enemy ? -ENDED : ENDED;
  if (result === 'defeat') return enemy ? ENDED : -ENDED;
  return 0;
}

/** An outcome's worth to the fighter planning, from where they stood. */
export function worthOf(
  start: PlanState,
  end: PlanState,
  { selfId, objective }: { selfId: string; objective: Objective | undefined },
): number {
  const self = start.fighters.find((f) => f.id === selfId);
  const enemy = self ? isEnemy(self) : true;
  const dealt = healthOf(start, !enemy) - healthOf(end, !enemy);
  const taken = healthOf(start, enemy) - healthOf(end, enemy);
  const ended = endedWorth(end.result, enemy);
  const hurt = objective === 'survive' ? SURVIVING_HURT : 1;
  return dealt - hurt * taken + ended + aimed(objective, start, end, selfId);
}
