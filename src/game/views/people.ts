import type { PersonDef, Tone } from '@/content';
import { stageName, stageOf, stageProgress } from '@/systems/bonds';
import type { Appearance } from '@/systems/profile';
import { STAT_INFO } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import type { GameContext } from '../context';
import { currentLocation } from '../ops';
import { bondOf, everyone, findPerson, fullName, peopleHere, whereNow } from '../people/cast';
import type { GameState } from '../state';
import { capitalise, choice, type Choice } from './common';

/** Stage at which you learn someone's traits, and then what they like to hear. */
const TRAITS_REVEALED_AT = 1;
const TASTES_REVEALED_AT = 2;

export type Relation = 'sensei' | 'teammate' | null;

/** Just enough to draw someone's face. */
export interface PersonFace {
  readonly id: string;
  readonly name: string;
  readonly appearance: Appearance;
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
}

export interface PersonSheet extends PersonCard {
  readonly bio: string;
  readonly clan: string | null;
  /** Null until you know them well enough. */
  readonly traits: readonly { readonly name: string; readonly note: string }[] | null;
  readonly likes: readonly string[] | null;
  readonly dislikes: readonly string[] | null;
  /** What getting closer will reveal next, if anything. */
  readonly reveal: string | null;
}

export interface BondsView {
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
  return team?.teammateIds.includes(personId) ? 'teammate' : null;
}

export function personFace(state: GameState, person: PersonDef): PersonFace {
  return {
    id: person.id,
    name: person.name,
    appearance: person.appearance,
    relation: relationTo(state, person.id),
  };
}

function whereLabel(state: GameState, ctx: GameContext, person: PersonDef): string {
  const placeId = whereNow(state, ctx, person);
  const place = placeId && currentLocation(state, ctx).places.find((p) => p.id === placeId);
  return place ? `At the ${place.name}` : 'Away';
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
  };
}

export function bondsView(state: GameState, ctx: GameContext): BondsView {
  const team = state.people.team;
  const teamIds = team ? [...(team.senseiId ? [team.senseiId] : []), ...team.teammateIds] : [];
  const cards = everyone(state, ctx).map((p) => personCard(state, ctx, p));
  const others = cards.filter((c) => !teamIds.includes(c.id));
  const met = (c: PersonCard) => state.people.bonds[c.id] !== undefined;
  return {
    team: teamIds.flatMap((id) => cards.filter((c) => c.id === id)),
    known: others.filter(met).sort((a, b) => b.stage - a.stage || b.progress - a.progress),
    strangers: others.filter((c) => !met(c)),
  };
}

export function personSheet(
  state: GameState,
  ctx: GameContext,
  personId: string,
): PersonSheet | null {
  const person = findPerson(state, ctx, personId);
  if (!person) return null;
  const card = personCard(state, ctx, person);
  const traits = person.traitIds.flatMap((id) => {
    const t = ctx.content.traits.get(id);
    return t ? [t] : [];
  });
  const tastes = (pick: (t: (typeof traits)[number]) => readonly Tone[]) => [
    ...new Set(traits.flatMap((t) => pick(t).map(toneLabel))),
  ];
  const knowsTraits = card.stage >= TRAITS_REVEALED_AT;
  const knowsTastes = card.stage >= TASTES_REVEALED_AT;
  return {
    ...card,
    bio: person.bio,
    clan: person.clanId ? (ctx.content.clans.get(person.clanId)?.name ?? null) : null,
    traits: knowsTraits ? traits.map((t) => ({ name: t.name, note: t.note })) : null,
    likes: knowsTastes ? tastes((t) => t.likes) : null,
    dislikes: knowsTastes ? tastes((t) => t.dislikes) : null,
    reveal: revealHint(knowsTraits, knowsTastes),
  };
}

function revealHint(knowsTraits: boolean, knowsTastes: boolean): string | null {
  if (!knowsTraits) return 'Talk more to learn what they are like.';
  if (!knowsTastes) return 'Become friends to learn what they like to hear.';
  return null;
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
