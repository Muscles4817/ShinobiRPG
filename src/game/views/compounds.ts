import type { OutsiderStance, PlaceDef, QuarterFields } from '@/content';

import { compoundAccess, compoundHere, type Compound } from '../compounds';
import type { GameContext } from '../context';
import { currentLocation } from '../ops';
import { findPerson, fullName, peopleHere } from '../people/cast';
import type { GameState } from '../state';
import { personCard, personFace, relationTo, type PersonCard, type PersonFace } from './people';

/**
 * The clans' quarter and each compound in it (`docs/design/compounds-plan.md`): who is home,
 * the head, how the clan treats outsiders, and whether the gate is open to you now. Also who is
 * out and about for the village screen: people you know, not those at home behind a gate.
 */

/** How a clan treats outsiders, as a phrase on its card. */
const STANCE_WORDS: Readonly<Record<OutsiderStance, string>> = {
  welcoming: 'Open to visitors by day',
  reserved: 'Wary of strangers',
  guarded: 'Closed to outsiders',
};

/** How many people you know the village screen shows out and about. */
const AROUND_SHOWN = 8;

export interface CompoundCard {
  readonly id: string;
  readonly name: string;
  readonly clan: string;
  readonly stance: string;
  /** Why the gate is shut to you now, or null when you'd be let in. */
  readonly shut: string | null;
  readonly home: number;
}

export interface CompoundView {
  readonly name: string;
  readonly clan: string;
  readonly description: string;
  readonly stance: string;
  readonly shut: string | null;
  /** The clan head, when the pack names one. */
  readonly head: string | null;
  /** Who is home now; empty while the gate is shut to you. */
  readonly home: readonly PersonCard[];
}

function homeAt(state: GameState, ctx: GameContext, placeId: string) {
  return peopleHere(state, ctx).filter((p) => p.placeId === placeId);
}

/** Your own clan's compound is home; anyone else's, how its clan treats outsiders. */
function stanceWords(state: GameState, ctx: GameContext, compound: Compound): string {
  if (state.character.clanId === compound.clanId) return 'Your family’s home';
  return STANCE_WORDS[ctx.content.clans.require(compound.clanId).outsiders ?? 'reserved'];
}

export function compoundCard(state: GameState, ctx: GameContext, compound: Compound): CompoundCard {
  return {
    id: compound.id,
    name: compound.name,
    clan: ctx.content.clans.require(compound.clanId).name,
    stance: stanceWords(state, ctx, compound),
    shut: compoundAccess(state, ctx, compound),
    home: homeAt(state, ctx, compound.id).length,
  };
}

/** One line for a compound or the quarter on the village screen. */
export function compoundLine(state: GameState, ctx: GameContext, compound: Compound): string {
  const card = compoundCard(state, ctx, compound);
  if (card.shut) return card.stance;
  return card.home === 0 ? 'Nobody home' : `${card.home} home`;
}

export function quarterLine(quarter: QuarterFields): string {
  return `${quarter.compoundIds.length} clans`;
}

export interface QuarterView {
  readonly name: string;
  readonly blurb: string;
  readonly compounds: readonly CompoundCard[];
}

/** The clans' quarter of your location, if it has one. */
export function quarterView(state: GameState, ctx: GameContext): QuarterView | null {
  const quarter = currentLocation(state, ctx).places.find((p) => p.kind === 'quarter');
  if (quarter?.kind !== 'quarter') return null;
  return {
    name: quarter.name,
    blurb: quarter.blurb,
    compounds: quarter.compoundIds.flatMap((id) => {
      const compound = compoundHere(state, ctx, id);
      return compound ? [compoundCard(state, ctx, compound)] : [];
    }),
  };
}

export function compoundView(
  state: GameState,
  ctx: GameContext,
  placeId: string,
): CompoundView | null {
  const compound = compoundHere(state, ctx, placeId);
  if (!compound) return null;
  const clan = ctx.content.clans.require(compound.clanId);
  const shut = compoundAccess(state, ctx, compound);
  const head = compound.headId ? findPerson(state, ctx, compound.headId) : null;
  return {
    name: compound.name,
    clan: clan.name,
    description: clan.description,
    stance: stanceWords(state, ctx, compound),
    shut,
    head: head ? fullName(head) : null,
    home: shut
      ? []
      : homeAt(state, ctx, placeId).map(({ person }) => personCard(state, ctx, person)),
  };
}

/** The compounds a quarter in your location stands for, kept off the village screen. */
export function quartered(state: GameState, ctx: GameContext): ReadonlyMap<string, string> {
  const places: readonly PlaceDef[] = currentLocation(state, ctx).places;
  return new Map(
    places.flatMap((p) =>
      p.kind === 'quarter' ? p.compoundIds.map((id) => [id, p.id] as const) : [],
    ),
  );
}

/** People you know who are out and about, not home behind a compound's gate. */
export function aroundYou(state: GameState, ctx: GameContext): readonly PersonFace[] {
  return peopleHere(state, ctx)
    .filter(({ person, placeId }) => {
      const known = state.people.bonds[person.id] !== undefined || relationTo(state, person.id);
      return known && !compoundHere(state, ctx, placeId);
    })
    .slice(0, AROUND_SHOWN)
    .map(({ person }) => personFace(state, person));
}
