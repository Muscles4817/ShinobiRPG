import type { PersonDef, Tone } from '@/content';
import { stageName, stageOf, stageProgress } from '@/systems/bonds';
import type { Look } from '@/systems/profile';
import { STAT_INFO } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import type { GameContext } from '../context';
import { currentLocation } from '../ops';
import { bondOf, everyone, fullName, peopleHere, whereNow } from '../people/cast';
import { personLook } from '../people/looks';
import type { GameState } from '../state';
import { capitalise, choice, type Choice } from './common';
import { companionCard, type CompanionCard } from './companion';

export { TASTES_REVEALED_AT } from './bondPath';

export type Relation = 'sensei' | 'teammate' | 'rival' | null;

/** Just enough to draw someone's face. */
export interface PersonFace {
  readonly id: string;
  readonly name: string;
  readonly appearance: Look;
  readonly relation: Relation;
}

export interface PersonCard extends PersonFace {
  readonly fullName: string;
  readonly title: string;
  readonly specialty: { readonly id: Discipline; readonly label: string } | null;
  readonly stage: number;
  readonly stageName: string;
  /** Progress through the current stage, 0–1. */
  readonly progress: number;
  /** Where they are now, e.g. "At the Training Grounds", or "Away". */
  readonly where: string;
  readonly talk: Choice;
  /** Null for people who don't spar (anyone but genin). */
  readonly spar: Choice | null;
}

export interface BondsView {
  /** Your companion, first of all, if you have one. */
  readonly companion: CompanionCard | null;
  readonly team: readonly PersonCard[];
  /** People you have talked to, closest first. */
  readonly known: readonly PersonCard[];
  readonly strangers: readonly PersonCard[];
}

export function toneLabel(tone: Tone): string {
  return capitalise(tone);
}

export function relationTo(state: GameState, personId: string): Relation {
  const team = state.people.team;
  if (team?.senseiId === personId) return 'sensei';
  if (team?.teammateIds.includes(personId)) return 'teammate';
  return state.rival?.personId === personId ? 'rival' : null;
}

export function personFace(state: GameState, person: PersonDef): PersonFace {
  return {
    id: person.id,
    name: person.name,
    appearance: personLook(person),
    relation: relationTo(state, person.id),
  };
}

function whereLabel(state: GameState, ctx: GameContext, person: PersonDef): string {
  const placeId = whereNow(state, ctx, person);
  const place = placeId && currentLocation(state, ctx).places.find((p) => p.id === placeId);
  // A place named "The Paper Lantern" is "At The Paper Lantern", not "At the The…".
  if (!place) return 'Away';
  return place.name.startsWith('The ') ? `At ${place.name}` : `At the ${place.name}`;
}

export function personCard(state: GameState, ctx: GameContext, person: PersonDef): PersonCard {
  const points = bondOf(state, person.id).points;
  const stage = stageOf(points);
  return {
    ...personFace(state, person),
    fullName: fullName(person),
    title: person.title,
    specialty: person.specialty
      ? { id: person.specialty, label: STAT_INFO[person.specialty].label }
      : null,
    stage,
    stageName: stageName(stage),
    progress: stageProgress(points),
    where: whereLabel(state, ctx, person),
    talk: choice(state, ctx, { type: 'talk', personId: person.id }),
    spar:
      person.role === 'genin' ? choice(state, ctx, { type: 'spar', personId: person.id }) : null,
  };
}

export function bondsView(state: GameState, ctx: GameContext): BondsView {
  const team = state.people.team;
  const teamIds = team ? [...(team.senseiId ? [team.senseiId] : []), ...team.teammateIds] : [];
  const cards = everyone(state, ctx).map((p) => personCard(state, ctx, p));
  const others = cards.filter((c) => !teamIds.includes(c.id));
  const met = (c: PersonCard) => state.people.bonds[c.id] !== undefined;
  return {
    companion: companionCard(state, ctx),
    team: teamIds.flatMap((id) => cards.filter((c) => c.id === id)),
    known: others.filter(met).sort((a, b) => b.stage - a.stage || b.progress - a.progress),
    strangers: others.filter((c) => !met(c)),
  };
}

/** Faces of everyone at each place right now, keyed by place id. */
export function facesByPlace(
  state: GameState,
  ctx: GameContext,
): ReadonlyMap<string, readonly PersonFace[]> {
  const map = new Map<string, PersonFace[]>();
  for (const { person, placeId } of peopleHere(state, ctx)) {
    map.set(placeId, [...(map.get(placeId) ?? []), personFace(state, person)]);
  }
  return map;
}
