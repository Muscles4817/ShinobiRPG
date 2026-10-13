import type { PersonDef } from '@/content';
import type { CombatOrders, CombatStance } from '@/systems/combat';
import { stageOf } from '@/systems/bonds';
import type { Discipline } from '@/systems/techniques';

import type { GameState } from '../state';
import { bondOf } from './cast';

/**
 * How your teammates fight beside you, and how much say you have in it. At first you have
 * none: each takes the stance their specialty suggests (their own judgement, or the sensei's).
 * A teammate who counts you a friend takes a stance from you; once they're a close friend, or
 * your sensei sees you as the team's leader, they let you set their cards too.
 */

/** A teammate's bond stage (Friend) from which they take a stance from you. */
export const STANCE_ORDERS_STAGE = 2;
/** A teammate's bond stage (Close friend) from which they let you set their cards. */
export const CARD_ORDERS_STAGE = 3;
/** Your sensei's bond stage (Close friend) from which every teammate follows your lead. */
export const LEADER_STAGE = 3;

/** What each specialty does by default: blades cover you, illusions and seals set up, fists press. */
const SPECIALTY_STANCE: Readonly<Record<Discipline, CombatStance['kind']>> = {
  taijutsu: 'press',
  ninjutsu: 'press',
  kenjutsu: 'cover',
  genjutsu: 'support',
  fuuinjutsu: 'support',
};

/** The stance a teammate takes on their own; a cover covers you. */
export function defaultStance(person: PersonDef, playerId: string): CombatStance {
  const kind = person.specialty ? SPECIALTY_STANCE[person.specialty] : 'press';
  return kind === 'cover' ? { kind, covers: playerId } : { kind };
}

function stageWith(state: GameState, personId: string | null): number {
  return personId === null ? 0 : stageOf(bondOf(state, personId).points);
}

/** Your sensei sees you as the team's leader. */
export function leadsTeam(state: GameState): boolean {
  return stageWith(state, state.people.team?.senseiId ?? null) >= LEADER_STAGE;
}

/** What you may change about this teammate in a fight, and why not when you can't. */
export function ordersFor(state: GameState, person: PersonDef): CombatOrders {
  return bondOrders(state, person, leadsTeam(state));
}

/** What a fellow shinobi you lead lets you change in a fight: as far as your bond goes. */
export function peerOrders(state: GameState, person: PersonDef): CombatOrders {
  return bondOrders(state, person, false);
}

function bondOrders(state: GameState, person: PersonDef, leader: boolean): CombatOrders {
  const stage = stageWith(state, person.id);
  const cards = leader || stage >= CARD_ORDERS_STAGE;
  const stance = cards || stage >= STANCE_ORDERS_STAGE;
  return {
    ...(stance
      ? {}
      : { stanceLocked: `${person.name} won't take orders from you yet. Become friends first.` }),
    ...(cards
      ? {}
      : {
          cardsLocked: `${person.name} fights their own way. Grow closer, or earn your sensei's trust.`,
        }),
  };
}
