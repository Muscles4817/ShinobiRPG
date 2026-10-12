import type { PersonDef } from '@/content';
import type { CombatantSetup } from '@/systems/combat';
import type { MissionDef, MissionNote, MissionRank } from '@/systems/missions';
import { MAX_HEALTH } from '@/systems/vitals';

import { PLAYER_COMBATANT_ID } from './combatants';
import type { GameContext } from './context';
import { adjust, chip, log } from './ops';
import { requirePerson } from './people/cast';
import { companionCombatant, senseiCombatant } from './people/companions';
import { personStats } from './people/progress';
import { defaultStance, ordersFor } from './people/teamOrders';
import { missionThreat } from './scouting';
import type { GameState } from './state';

/**
 * Who goes out on a team mission and what they do besides fight: the teammates (with the orders
 * your bonds have earned), the sensei when the job is serious, and the medic who patches you up
 * between stages.
 */

const TEAMMATE_TAG = 'Teammate';
const SENSEI_TAG = 'Sensei';
const SENSEI_ORDERS = 'Your sensei leads this mission. They don’t take orders from you.';
const SENSEI_CARDS = 'They fight their own way.';

/** Mission ranks, lowest first; from `SERIOUS_RANK` up, the sensei comes along. */
const RANK_ORDER: readonly MissionRank[] = ['D', 'C', 'B', 'A', 'S'];
export const SERIOUS_RANK: MissionRank = 'C';

/** Chakra control (grade D) a teammate needs to be any use as a medic. */
export const MEDIC_CONTROL = 8;
/** Health a medic restores between stages, per point of their chakra control. */
export const MEDIC_HEAL_PER_CONTROL = 1;

function teammates(state: GameState, ctx: GameContext, def: MissionDef | null): PersonDef[] {
  if (!def?.withTeam) return [];
  return (state.people.team?.teammateIds ?? []).map((id) => requirePerson(state, ctx, id));
}

/**
 * Whether a job is serious enough for the sensei to come: C-rank and up, or a foe the notice
 * reads as far stronger than you.
 */
export function seriousJob(state: GameState, ctx: GameContext, def: MissionDef): boolean {
  if (RANK_ORDER.indexOf(def.rank) >= RANK_ORDER.indexOf(SERIOUS_RANK)) return true;
  return missionThreat(state, ctx, def)?.threat === 'much-stronger';
}

/** Your sensei, when they lead this team mission; null otherwise. */
export function senseiAlong(
  state: GameState,
  ctx: GameContext,
  def: MissionDef | null,
): PersonDef | null {
  const senseiId = state.people.team?.senseiId;
  if (!def?.withTeam || !senseiId || !seriousJob(state, ctx, def)) return null;
  return requirePerson(state, ctx, senseiId);
}

/**
 * The team beside you in a mission fight: teammates in the stance their specialty suggests,
 * taking from you only the orders your bonds have earned, and on serious jobs the sensei, who
 * fights their own way.
 */
export function teamAllies(
  state: GameState,
  ctx: GameContext,
  def: MissionDef | null,
): CombatantSetup[] {
  const team = teammates(state, ctx, def).map((person) => ({
    ...companionCombatant(person, state, ctx, TEAMMATE_TAG),
    stance: defaultStance(person, PLAYER_COMBATANT_ID),
    orders: ordersFor(state, person),
  }));
  const sensei = senseiAlong(state, ctx, def);
  if (!sensei) return team;
  return [
    ...team,
    {
      ...senseiCombatant(sensei, state, ctx, SENSEI_TAG),
      stance: defaultStance(sensei, PLAYER_COMBATANT_ID),
      orders: { stanceLocked: SENSEI_ORDERS, cardsLocked: SENSEI_CARDS },
    },
  ];
}

/** The teammate best at patching people up, if any is good enough to be a medic. */
export function medicOf(
  state: GameState,
  ctx: GameContext,
  def: MissionDef | null,
): { readonly person: PersonDef; readonly control: number } | null {
  return teammates(state, ctx, def).reduce<{ person: PersonDef; control: number } | null>(
    (best, person) => {
      const control = personStats(person, state).chakraControl;
      if (control < MEDIC_CONTROL || (best && best.control >= control)) return best;
      return { person, control };
    },
    null,
  );
}

/** Between stages, the team's medic sees to your wounds. */
export function tendWounds(state: GameState, ctx: GameContext, def: MissionDef): GameState {
  const medic = medicOf(state, ctx, def);
  const missing = MAX_HEALTH - state.character.vitals.health;
  if (!medic || missing <= 0 || !state.mission) return state;
  const healed = Math.min(missing, Math.round(medic.control * MEDIC_HEAL_PER_CONTROL));
  const text = `${medic.person.name} sees to your wounds before you go on.`;
  const note: MissionNote = { kind: 'story', text };
  const mission = { ...state.mission, notes: [...state.mission.notes, note] };
  const tended = adjust({ ...state, mission }, { health: healed });
  return log(tended, { text, tone: 'success', chips: [chip(`+${healed} health`, 'gain')] });
}
