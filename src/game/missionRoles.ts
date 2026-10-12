import type { StatId } from '@/systems/stats';

import type { GameContext } from './context';
import { activeMission } from './missionFlow';
import { requirePerson } from './people/cast';
import { personStats } from './people/progress';
import type { GameState } from './state';

/**
 * Mission roles: on a team mission, a check falls to whoever on the team is best at it (the
 * tracker follows the trail, the sensor feels for chakra). Alone, it is always you.
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
  return (state.people.team?.teammateIds ?? []).reduce<Hand>((best, id) => {
    const person = requirePerson(state, ctx, id);
    const value = personStats(person, state)[stat];
    return value > best.value ? { personId: id, name: person.name, value } : best;
  }, you);
}
