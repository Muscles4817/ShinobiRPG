import type { PersonDef } from '@/content';
import type { CombatantSetup, CombatOrders } from '@/systems/combat';
import type { Crew, MissionNote } from '@/systems/missions';
import { MAX_HEALTH } from '@/systems/vitals';

import { PLAYER_COMBATANT_ID } from './combatants';
import type { GameContext } from './context';
import { crewOf } from './crew';
import { adjust, chip, log } from './ops';
import { requirePerson } from './people/cast';
import { companionCombatant, senseiCombatant } from './people/companions';
import { personStats } from './people/progress';
import { defaultStance, ordersFor, peerOrders } from './people/teamOrders';
import type { GameState } from './state';

/**
 * Who is out on a job with you and what they do besides fight: the crew (with the orders your
 * bonds, or your lead, have earned), whoever leads it when it isn't you, and the medic who
 * patches you up between stages.
 */

const TEAMMATE_TAG = 'Teammate';
const SENSEI_TAG = 'Sensei';
const LEADER_TAG = 'Leader';
const SENSEI_ORDERS = 'Your sensei leads this mission. They don’t take orders from you.';
const LEADER_CARDS = 'They fight their own way.';

/** Chakra control (grade D) a teammate needs to be any use as a medic. */
export const MEDIC_CONTROL = 8;
/** Health a medic restores between stages, per point of their chakra control. */
export const MEDIC_HEAL_PER_CONTROL = 1;

/** The people out with you besides whoever leads. */
export function crewMembers(state: GameState, ctx: GameContext): PersonDef[] {
  return crewOf(state).memberIds.map((id) => requirePerson(state, ctx, id));
}

/** Whoever leads the job when it isn't you; null when you lead, or nobody does. */
export function crewLeader(state: GameState, ctx: GameContext): PersonDef | null {
  const { leaderId } = crewOf(state);
  return leaderId === null ? null : requirePerson(state, ctx, leaderId);
}

/** What you may change about a crew member in a fight, by who leads and who they are. */
function memberOrders(
  state: GameState,
  crew: Crew,
  person: PersonDef,
  leader: PersonDef | null,
): CombatOrders {
  // Your team answers to its sensei as it does at home: your bonds decide your say.
  if (crew.kind === 'old-team' || crew.kind === 'exam-team') return ordersFor(state, person);
  if (leader) {
    const locked = `${leader.name} gives the orders on this job.`;
    return { stanceLocked: locked, cardsLocked: locked };
  }
  // Genin you lead do as they're told; fellow chūnin as far as they count you a friend.
  return crew.kind === 'genin-squad' ? {} : peerOrders(state, person);
}

/**
 * The crew beside you in a mission fight: members in the stance their specialty suggests,
 * taking from you only the orders they owe you, and whoever leads, who fights their own way.
 */
export function teamAllies(state: GameState, ctx: GameContext): CombatantSetup[] {
  const crew = crewOf(state);
  const leader = crewLeader(state, ctx);
  const members = crewMembers(state, ctx).map((person) => ({
    ...companionCombatant(person, state, ctx, TEAMMATE_TAG),
    stance: defaultStance(person, PLAYER_COMBATANT_ID),
    orders: memberOrders(state, crew, person, leader),
  }));
  if (!leader) return members;
  const sensei = crew.kind === 'old-team';
  const leads = sensei
    ? SENSEI_ORDERS
    : `${leader.name} leads this mission. They don’t take orders from you.`;
  return [
    ...members,
    {
      ...senseiCombatant(leader, state, ctx, sensei ? SENSEI_TAG : LEADER_TAG),
      stance: defaultStance(leader, PLAYER_COMBATANT_ID),
      orders: { stanceLocked: leads, cardsLocked: LEADER_CARDS },
    },
  ];
}

/** The crew member best at patching people up, if any is good enough to be a medic. */
export function medicOf(
  state: GameState,
  ctx: GameContext,
): { readonly person: PersonDef; readonly control: number } | null {
  return crewMembers(state, ctx).reduce<{ person: PersonDef; control: number } | null>(
    (best, person) => {
      const control = personStats(person, state).chakraControl;
      if (control < MEDIC_CONTROL || (best && best.control >= control)) return best;
      return { person, control };
    },
    null,
  );
}

/** Between stages, the crew's medic sees to your wounds. */
export function tendWounds(state: GameState, ctx: GameContext): GameState {
  const medic = medicOf(state, ctx);
  const missing = MAX_HEALTH - state.character.vitals.health;
  if (!medic || missing <= 0 || !state.mission) return state;
  const healed = Math.min(missing, Math.round(medic.control * MEDIC_HEAL_PER_CONTROL));
  const text = `${medic.person.name} sees to your wounds before you go on.`;
  const note: MissionNote = { kind: 'story', text };
  const mission = { ...state.mission, notes: [...state.mission.notes, note] };
  const tended = adjust({ ...state, mission }, { health: healed });
  return log(tended, { text, tone: 'success', chips: [chip(`+${healed} health`, 'gain')] });
}
