import type { CheckApproach } from '@/systems/missions';
import type { StatId } from '@/systems/stats';

import type { GameContext } from './context';
import { fieldTeamIds } from './exam/fieldTeam';
import { activeMission } from './missionFlow';
import { requirePerson } from './people/cast';
import { personStats } from './people/progress';
import { ordersFor } from './people/teamOrders';
import type { GameState } from './state';

/**
 * Mission roles: on a team mission, a check falls to whoever on the team is best at it (the
 * tracker follows the trail, the sensor feels for chakra). Alone, it is always you. Sneaking,
 * the team moves only as quietly as its slowest member who won't hang back when you ask.
 */

/** Who takes a check, and with what. */
export interface Hand {
  /** Null when it is you. */
  readonly personId: string | null;
  readonly name: string;
  readonly value: number;
}

export function bestHandFor(state: GameState, ctx: GameContext, stat: StatId): Hand {
  const you: Hand = { personId: null, name: 'You', value: state.character.stats[stat] };
  if (!activeMission(state, ctx)?.withTeam) return you;
  return fieldTeamIds(state).reduce<Hand>((best, id) => {
    const person = requirePerson(state, ctx, id);
    const value = personStats(person, state)[stat];
    return value > best.value ? { personId: id, name: person.name, value } : best;
  }, you);
}

/** Who takes a mission check: a role's best teammate, or you when the check names no role. */
export function checkHand(state: GameState, ctx: GameContext, approach: CheckApproach): Hand {
  if (approach.role) return bestHandFor(state, ctx, approach.stat);
  return { personId: null, name: 'You', value: state.character.stats[approach.stat] };
}

/**
 * The teammate who sets the team's pace when sneaking: the slowest of those who won't take your
 * orders (those who do hang back when told). Null when nobody holds you back.
 */
export function slowestAlong(state: GameState, ctx: GameContext): Hand | null {
  if (!activeMission(state, ctx)?.withTeam) return null;
  return fieldTeamIds(state).reduce<Hand | null>((slowest, id) => {
    const person = requirePerson(state, ctx, id);
    if (!ordersFor(state, person).stanceLocked) return slowest;
    const value = personStats(person, state).speed;
    return slowest && slowest.value <= value ? slowest : { personId: id, name: person.name, value };
  }, null);
}
