import type { Discipline } from '@/systems/techniques';

import { SPAR_ENERGY } from '../actions/spar';
import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { everyone, whereNow } from '../people/cast';
import { scoutPerson, type ScoutingRead } from '../scouting';
import type { GameState } from '../state';
import { hardWorkEnergy } from '../profile';
import { choice, type Choice } from './common';
import { personCard, personFace, type PersonFace } from './people';

/** Sparring partners at the training ground. */

export interface SparOption extends Choice {
  readonly person: PersonFace;
  readonly where: string;
  readonly specialty: { readonly id: Discipline; readonly label: string } | null;
  readonly energyCost: number;
  /** How they size up against you. */
  readonly read: ScoutingRead | null;
}

/**
 * Partners worth offering at the training ground: your teammates (wherever they are in the
 * village) and genin training here now. Anyone else around can be asked from their sheet.
 */
export function sparOptions(state: GameState, ctx: GameContext): SparOption[] {
  const training = placeHere(state, ctx, 'training');
  const teammates = state.people.team?.teammateIds ?? [];
  return everyone(state, ctx)
    .filter((p) => p.role === 'genin')
    .filter((p) => teammates.includes(p.id) || whereNow(state, ctx, p) === training?.id)
    .map((p) => ({ person: p, card: personCard(state, ctx, p) }))
    .filter(({ card }) => card.where !== 'Away')
    .map(({ person, card }) => ({
      ...choice(state, ctx, { type: 'spar', personId: person.id }),
      person: personFace(state, person),
      where: card.where,
      specialty: card.specialty,
      energyCost: hardWorkEnergy(state.character, ctx, SPAR_ENERGY),
      read: scoutPerson(state, ctx, person.id),
    }))
    .sort((a, b) => Number(b.person.relation !== null) - Number(a.person.relation !== null));
}
